import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
	fullName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ["buyer", "seller"],
		default: "buyer",
	},
	profilePic: {
		type: String,
	},
    listings: {
        type: Number
    }
}, {timestamps: true});

const User = mongoose.model("User", userSchema)

export default User
