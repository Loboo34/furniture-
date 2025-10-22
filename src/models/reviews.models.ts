 import { date, required } from "joi";
import mongoose, { Schema } from "mongoose";
import { ref } from "process";

const reviewSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: [true, "Product id required"],
	},
	content: {
		type: String,
		required: true,
	},
	stars: {
		type: Number,
		required: false,
	},
	likesCount: {
		type: Number,
		default: 0,
	}
}, {timestamps: true});

const Review = mongoose.model("Review", reviewSchema)

export default Review
