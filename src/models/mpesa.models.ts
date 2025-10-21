import mongoose from "mongoose";

const mpesaSchema = new mongoose.Schema({
	amount: { type: Number, required: true },
	phoneNumber: { type: String },
	name: { type: String, default: "Unknown" },
	status: {
		type: String,
		enum: ["pending", "success", "failed"],
		default: "pending",
	},
	products: [
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
			quantity: {
				type: Number,
				default: 1,
			},
			price: {
				type: Number,
			},
		},
	],
	order: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Order",
	},
	mpesaReceiptNumber: { type: String },
	checkoutRequestId: { type: String },
	merchantRequestId: { type: String },
	resultCode: { type: Number },
	resultDesc: { type: String },
	transactionDate: { type: String },
	createdAt: { type: Date, default: Date.now },
});

const MpesaTransaction = mongoose.model("MpesaTransaction", mpesaSchema);

export default MpesaTransaction;
