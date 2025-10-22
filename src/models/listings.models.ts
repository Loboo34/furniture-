
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
	{
		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

 const Listing = mongoose.model("Listing", listingSchema);

 export default Listing
