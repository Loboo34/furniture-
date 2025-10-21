import { Request, Response } from "express";
import mongoose from "mongoose";

import Order from "../models/orde.models";
import Product from "../models/product.models";
import { mpesaController } from "../services/mpesa.controller";
import { logger } from "../utils/logger";
import MpesaTransaction from "../models/mpesa.models";

export const makeOrder = async (req: Request, res: Response) => {
	// prefer authenticated user, fallback to body.buyer if provided (useful for Postman/testing)
	const buyerId = req.user?.id ?? req.body?.buyer;
	const { items, paymentMethod, phoneNumber, shippingInfo } = req.body;

	//generate order number
	const generateOrderNumber = () => {
		const prefix = "#";
		const timestamp = Date.now().toString();
		const random = Math.floor(Math.random() * 1000)
			.toString()
			.padStart(3, "0");
		return `${prefix}-${timestamp.slice(-8)}-${random}`;
	};

	try {
		if (!Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ message: "Items required" });
		}
		let subTotal = 0;
		const orderItems = [];
		let sellerId: any = undefined;
		for (const item of items) {
			const product = await Product.findById(item.product);
			if (!product) {
				res.status(404).json({ message: "Product Not found" });
				return;
			}
			if (product.stock < item.quantity) {
				res.status(400).json({ message: "Issuficient stock" });
				return;
			}

			const itemTotal = product.price * item.quantity;
			subTotal += itemTotal;

			orderItems.push({
				product: product._id,
				name: product.name,
				price: product.price,
				quantity: item.quantity,
				image: product.image,
			});
			logger.info("Order:", orderItems);

			product.stock -= item.quantity;
			await product.save();

			// set seller from first product (if needed)
			if (!sellerId && (product as any).seller)
				sellerId = (product as any).seller;
		}

		const shipping = subTotal * 0.1;
		// fix: total should be addition, not subtraction
		const total = subTotal + shipping;

		const orderData = {
			buyer: buyerId, // ensure buyer is saved
			seller: sellerId,
			orderNumber: generateOrderNumber(),
			shippingInfo,
			items: orderItems,
			paymentMethod,
			phoneNumber,
			subTotal,
			shipping,
			total,
			paymentStatus: "pending"
		};
		const order = await Order.create(orderData);

		if(paymentMethod === "mpesa"){
			try{
				const mpesaRes: any = await mpesaController.initiatePayment({
					amount: total,
					products: orderItems,
					phoneNumber: phoneNumber,
					accountReference: String(order._id),
					transactionDesc: `payment for order ${order.orderNumber}`,
				})

				const checkoutRequestId = mpesaRes?.CheckoutRequestID ?? mpesaRes?.Response?.checkoutRequestId ?? null;
				const merchantRequestId = mpesaRes?.MerchantRequestID ?? mpesaRes?.Response?.MerchantRequestID ?? null;

				const tx = new MpesaTransaction({
					amount: total,
					phoneNumber: phoneNumber ?? "Uknown",
					status: "pending",
					products: orderItems.map((it) => ({
						product: it.product,
						quantity: it.quantity,
						price: it.price,
					})),
					order: order._id,
					checkoutRequestId: checkoutRequestId ?? undefined,
					merchantRequestId: merchantRequestId ?? undefined
				});
				await tx.save();

				 if (checkoutRequestId) {
						order.mpesaCheckoutRequestID = checkoutRequestId;
						order.mpesaReceiptNumber = order.mpesaReceiptNumber ?? "";
						await order.save();
					}

					logger.info("Mpesa transaction completed")
					return res.status(201).json({success: true, order, mpesa: mpesaRes})
			} catch(err){
				logger.info("Mpesa stk failed", err)
				return res.status(201).json({success: true, order, message:"Failed to initiate Mpesa payment"})
			}
		}

		logger.info("Order made successfully", order);
		res.status(201).json({ success: true, order });
	} catch (err) {
		logger.error("Failed to make order");
		res.status(500).json({ message: "Server Error" });
	}
};

export const getSellersOrders = async (req: Request, res: Response) => {
	const sellerId = req.params.id ?? req.user?.id;
	if (!sellerId)
		return res.status(401).json({ message: "Authentication required" });

	try {
		const orders = await Order.find({ seller: sellerId })
			.populate("items.product", "name images")
			.populate("buyer", "_id") // populate buyer so we can return buyer id reliably
			.sort({ createdAt: -1 });

		const out = orders.map((o) => {
			const obj = o.toObject();
			const buyerId =
				obj.buyer && typeof obj.buyer === "object"
					? obj.buyer._id ?? obj.buyer
					: obj.buyer;
			return { ...obj, buyerId, seller: undefined };
		});

		return res.status(200).json({ success: true, orders: out });
	} catch (err) {
		logger.error("Failed to fetch orders", err);
		return res.status(500).json({ message: "Server Error" });
	}
};

export const getBuyersOrders = async (req: Request, res: Response) => {
	const buyerId = req.params.id ?? req.user?.id;
	if (!buyerId)
		return res.status(401).json({ message: "Authentication required" });

	try {
		const orders = await Order.find({ buyer: buyerId })
			.populate("items.product", "name images")
			.populate("seller", "_id") // populate seller so we can return seller id
			.sort({ createdAt: -1 });

		const out = orders.map((o) => {
			const obj = o.toObject();
			const sellerId =
				obj.seller && typeof obj.seller === "object"
					? obj.seller._id ?? obj.seller
					: obj.seller;
			return { ...obj, sellerId };
		});

		return res.status(200).json({ success: true, orders: out });
	} catch (err) {
		logger.error("Failed to fetch orders");
		return res.status(500).json({ message: "Server Error" });
	}
};
export const updateStatus = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { status } = req.body;

	try {
		const order = await Order.findById(id);
		if (!order) {
			res.status(400).json({ message: "Order not found" });
			return;
		}
		const oldStatus = order.status;
		order.status = status;

		if (status === "delivered" && oldStatus !== "delivered") {
			order.actualDelivery = new Date();
		}

		await order.save();
		logger.info(`stsrus of ${order.orderNumber} updated`);
		res.status(200).json({ seccess: true, order });
	} catch (err) {
		logger.error("Failed to update status");
		res.status(500).json({ message: "Server error" });
	}
};

export const cancelOrder = async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = req.user?.id;
	
	if (!userId) {
		return res.status(401).json({ message: "Authentication required" });
	}

	const session = await mongoose.startSession();
	try {
		session.startTransaction();

		// load order inside session (populate for convenience)
		const order = await Order.findById(id)
			.session(session)
			.populate("items.product");
		if (!order) {
			await session.abortTransaction();
			session.endSession();
			return res
				.status(404)
				.json({ success: false, message: "Order not found" });
		}

		const status = (order.status ?? "").toString().toLowerCase();
		if (["shipped", "delivered", "cancelled"].includes(status)) {
			await session.abortTransaction();
			session.endSession();
			 res
				.status(400)
				.json({ success: false, message: "Order cannot be cancelled" });
				return
		}

		// Authorization: allow buyer or seller to cancel
		const orderBuyerId = String(order.buyer);
		const orderSellerId = order.seller ? String(order.seller) : undefined;
		if (userId !== orderBuyerId && userId !== orderSellerId) {
			await session.abortTransaction();
			session.endSession();
			return res
				.status(403)
				.json({
					success: false,
					message: "Not authorized to cancel this order",
				});
		}

		// Restore stock using atomic $inc updates (safer & faster than loading each product)
		for (const item of order.items ?? []) {
			const productId = (item.product as any)?._id ?? item.product;
			if (!productId) continue;
			await Product.updateOne(
				{ _id: productId },
				{ $inc: { stock: item.quantity } },
				{ session }
			);
		}

		order.status = "cancelled";
		await order.save({ session });

		await session.commitTransaction();
		session.endSession();

		// populate for response (outside transaction)
		await order.populate("items.product");
		logger.info("Order canceled");
		return res.status(200).json({ success: true, order });
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		logger.error("Failed to cancel order", err);
		return res.status(500).json({ message: "Server Error" });
	}
};
