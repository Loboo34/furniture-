import { required } from "joi";
import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	quantity: { type: Number, required: true, default: 1 },
	price: { type: Number, required: true },
});

const cartSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	items: {
		type: [cartItemSchema],
		default: [],
	},
	subTotal: {
		type: Number,
		default: 0,
	},
	shipping: {
		type: Number,
		default: 0,
	},
	total: {
		type: Number,
		default: 0,
	},
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
