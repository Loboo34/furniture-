import jwt, { SignOptions } from "jsonwebtoken";
import { sign, verify } from "jsonwebtoken";

export interface JwtPayload {
	id: string;
	email: string;
	role: string;
	fullName: string;
}

interface ExtendedJwtPayload extends jwt.JwtPayload {
	id: string;
	email: string;
	role: string;
	fullName: string;
}

export const generateToken = (payload: object): string => {
	const token = sign(payload, process.env.JWT_SECRET as string, {
		expiresIn: "1h",
	});
	return token;
};

function assertString(value: any, name: string): asserts value is string {
	if (!value || typeof value !== "string") {
		throw new Error(`${name} is not defined in environment variables`);
	}
}

export const verifyToken = (token: string): JwtPayload => {
	try {
		assertString(process.env.JWT_SECRET, "JWT_SECRET");

		// avoid strict issuer/audience checks unless generateToken sets same values
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET
		) as ExtendedJwtPayload;

		return {
			id: decoded.id,
			email: decoded.email,
			role: decoded.role,
			fullName: decoded.fullName,
		};
	} catch (error) {
		throw new Error("Invalid or expired token");
	}
};
