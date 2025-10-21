import express, { json } from "express";
import { Request, Response } from "express";
import { logger } from "../utils/logger";
import MpesaTransaction from "../models/mpesa.models";
import Order from "../models/orde.models";

export const callBack = async (req: Request, res: Response) => {
	try {
		logger.info("=== CALLBACK DEBUG INFO ===");
		logger.info("Headers:", JSON.stringify(req.headers, null, 2));
		logger.info("Body:", JSON.stringify(req.body, null, 2));
		logger.info("Raw body:", req.body);
		logger.info("Body type:", typeof req.body);
		logger.info("Body keys:", Object.keys(req.body || {}));
		logger.info("=== END DEBUG INFO ===");

		// const safaricomIPs = process.env.SAFARICOM_IPS?.split(",") || [];
		// const clientIP = req.ip || req.connection.remoteAddress;

		// if (
		//   process.env.NODE_ENV === "production" &&
		//   safaricomIPs.length > 0 &&
		//   !safaricomIPs.includes(clientIP)
		// ) {
		//   logger.warn(`Unauthorized callback attempt from IP: ${clientIP}`);
		//   return res.status(403).json({ error: "Unauthorized" });
		// }

		const body = req.body;
		if (!body?.Body?.stkCallback?.CheckoutRequestID) {
			logger.error("Missing required callback fields");
			return res.status(400).json({ error: "Invalid callback format" });
		}

		if (!body || Object.keys(body).length === 0) {
			logger.error("Empty callback body received");

			const transaction = new MpesaTransaction({
				amount: 0,
				phoneNumber: "Unknown",
				name: "Empty Callback",
				status: "failed",
				resultDesc: "Empty callback body received",
			});
			await transaction.save();
			return res.status(200).json({ message: "Empty callback processed" });
		}

		const stkCallback = body.Body?.stkCallback;
		if (!stkCallback) {
			logger.error("Invalid callback structure - missing stkCallback", body);
			const transaction = new MpesaTransaction({
				amount: 0,
				phoneNumber: "Unknown",
				name: "Invalid Structure",
				status: "failed",
				resultDesc: "Invalid callback structure",
			});
			await transaction.save();
			return res.status(200).json({ message: "Invalid callback processed" });
		}

		const resultCode = stkCallback.ResultCode;
		let resultStatus: "pending" | "paid" | "failed" | "cancelled" | "timeout" =
			"failed";

		if (resultCode === 0) {
			resultStatus = "paid";
		} else if (resultCode === 1032) {
			resultStatus = "cancelled";
		} else if (resultCode === 1037) {
			resultStatus = "timeout";
		} else {
			resultStatus = "failed";
		}

		const resultDesc = stkCallback.ResultDesc;
		const checkoutRequestId = stkCallback.CheckoutRequestID;
		const merchantRequestId = stkCallback.MerchantRequestID;

		let amount = 0;
		let phoneNumber = "Unknown";
		let mpesaReceiptNumber = "";
		let transactionDate = "";

		if (resultCode === 0 && stkCallback.CallbackMetadata) {
			const items = stkCallback.CallbackMetadata.Item;
			logger.info("CallbackMetadata items:", items);

			for (const item of items) {
				switch (item.Name) {
					case "Amount":
						amount = parseFloat(item.Value);
						break;
					case "PhoneNumber":
						phoneNumber = item.Value.toString();
						break;
					case "MpesaReceiptNumber":
						mpesaReceiptNumber = item.Value;
						break;
					case "TransactionDate":
						transactionDate = item.Value.toString();
						break;
				}
			}
		}

		let accountReference = null;
		if (stkCallback.AccountReference) {
			accountReference = stkCallback.AccountReference;
		}

		// Check for duplicate transaction
		const isTransactionProcessed = async (
			checkoutRequestId: string
		): Promise<boolean> => {
			const existingTransaction = await MpesaTransaction.findOne({
				checkoutRequestId: checkoutRequestId,
			});
			return !!existingTransaction;
		};

		if (await isTransactionProcessed(checkoutRequestId)) {
			logger.info(
				`Duplicate callback received for CheckoutRequestID: ${checkoutRequestId}`
			);
			return res.status(200).json({ message: "Transaction already processed" });
		}

		// Create transaction record
		const transaction = new MpesaTransaction({
			amount: amount,
			phoneNumber: phoneNumber,
			name: mpesaReceiptNumber || "Unknown",
			status: resultCode === 0 ? "success" : "failed",
			mpesaReceiptNumber: mpesaReceiptNumber,
			checkoutRequestId: checkoutRequestId,
			merchantRequestId: merchantRequestId,
			resultCode: resultCode,
			resultDesc: resultDesc,
			transactionDate: transactionDate,
		});

		await transaction.save();
		const maskPhoneNumber = (phone: string): string => {
			if (!phone || phone === "Unknown") return phone;
			return phone.slice(0, 5) + "****" + phone.slice(-3);
		};

		logger.info("Transaction saved successfully:", {
			amount,
			phoneNumber: maskPhoneNumber(phoneNumber),
			status: resultCode === 0 ? "success" : "failed",
			mpesaReceiptNumber,
		});

		// After extracting accountReference or CheckoutRequestID from callback:
		const query: any[] = [];
		if (accountReference) query.push({ _id: accountReference });
		if (checkoutRequestId)
			query.push({ mpesaCheckoutRequestID: checkoutRequestId });

		const order = await Order.findOne(query.length ? { $or: query } : {});
		if (order) {
			if (resultCode === 0) {
				order.paymentStatus = "paid";
			} else if (resultCode === 1032) {
				order.paymentStatus = "failed";
			} else if (resultCode === 1037) {
				order.paymentStatus = "failed";
			} else {
				order.paymentStatus = "failed";
			}

			order.mpesaReceiptNumber = mpesaReceiptNumber || "";
			order.resultDesc = resultDesc;
			await order.save();

			transaction.products = order.items;
			transaction.order = order._id;
			await transaction.save();
		}

		res.status(200).json({ message: "Callback processed successfully" });
	} catch (error) {
		logger.error("Error processing M-Pesa callback:", error);
		return res.status(500).json({ error: "Failed to process callback" });
	}
};
