import { Request, Response, NextFunction } from "express";

import User from "../models/user.models";
import { verifyToken, JwtPayload } from "../utils/jwt";

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({
				success: false,
				message: "Access token is required",
			});
			return;
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix

		try {
			// verifyToken now returns decoded payload
			const decoded: JwtPayload = verifyToken(token);

			// find the user from DB to ensure it still exists
			const user = await User.findById(decoded.id).select("-password");
			if (!user) {
			 res.status(401).json({
					success: false,
					message: "User not found",
				});
                return
			}

			// Add user to request object (use fetched user values)
			req.user = {
				id: user._id.toString(),
				email: user.email,
				role: (user as any).role,
			};

			next();
		} catch (tokenError) {
			res.status(401).json({
				success: false,
				message: "Invalid or expired token",
			});
		}
	} catch (error) {
		console.error("Authentication error:", error);
		res.status(500).json({
			success: false,
			message: "Authentication failed",
		});
	}
};
