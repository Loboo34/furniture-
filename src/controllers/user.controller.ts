import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/user.models";
import { logger } from "../utils/logger";
import { generateToken } from "../utils/jwt";

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				role: "seller" | "buyer";
			};
		}
	}
}

export const register = async (req: Request, res: Response) => {
	const { fullName, email, password, role } = req.body;

	try {
		//check if user exists
		const isExist = await User.findOne({ email });
		if (isExist) {
			logger.info("User alredy exists");
			res.status(400).json({ success: false, message: "User already exists" });
			return;
		}

		//hashing pass
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({
			fullName,
			email,
			password: hashedPassword,
			role,
		});

		await newUser.save();
		const token = generateToken({ id: newUser._id, email: newUser.email });
		logger.info("User created succesfully");
		res.status(201).json({
			success: true,
			user: { id: newUser._id, fullName, email, role },
			token,
		});
	} catch (err) {
		logger.error("Failed To register User", err);
		res.status(500).json({ message: "Server error" });
	}
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	try {
		//finding user by email
		const user = await User.findOne({ email });
		if (!user) {
			res.status(404).json({ success: false, message: "User not found" });
			return;
		}
		//comparing the input pass to one in the db
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			res.status(401).json({ message: "Invalid password" });
			return;
		}
		const token = generateToken({ id: user._id, email: user.email });
		const safeUser = await User.findById(user._id).select("-password");
		logger.info("Login successful");
		res.status(200).json({ success: true, user: safeUser, token });
	} catch (err) {
		logger.error("Error while loging in", err);
		res.status(500).json({ message: "Server error" });
	}
};

export const getUserProfile = async (req: Request, res: Response) => {
	const userId = req.user?.id;
	if (!userId) {
		res
			.status(401)
			.json({ success: false, message: "Authentication required" });
		return;
	}
	try {
		const user = await User.findById(userId).select("-password");
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}
		logger.info(user);
		return res.status(200).json(user);
	} catch (err) {
		logger.error("Unable to get user");
		return res.status(500).json({ message: "Server error" });
	}
};
