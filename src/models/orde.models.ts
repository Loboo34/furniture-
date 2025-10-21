import { required } from "joi";
import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		name: { type: String },
		image: { type: String },
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		price: {
			type: Number,
			required: true,
		},
	},
	{ _id: false }
);

const orderSchema = new Schema(
	{
		buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		items: [orderItemSchema],
		orderNumber: {
			type: String,
			unique: true,
		},
		subTotal: {
			type: Number,
		},
		shipping: {
			type: Number,
		},
		total: {
			type: Number,
		},
		paymentMethod: {
			type: String,
			enum: ["mpesa"],
		},
		phoneNumber: {
			type: String,
		},
		shippingInfo: {
			city: {
				type: String,
			},
			address: {
				type: String,
			},
		},
		status: {
			type: String,
			enum: ["pending", "shipped", "cancelled", "delivered"],
			default: "pending",
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "paid", "failed", "cancelled", "timeout"],
			default: "pending",
		},
		mpesaCheckoutRequestID: {
			type: String,
		},
		mpesaReceiptNumber: {
			type: String,
		},
		actualDelivery: {
			type: Date,
		},
		resultDesc: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
