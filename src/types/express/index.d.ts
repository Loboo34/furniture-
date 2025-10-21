import { Request } from "express";

declare namespace Express {
	interface User {
		id: string;
		email?: string;
		role?: "seller" | "buyer";
	}
	interface Request {
		user?: User;
	}
}

// required to make this file a module and avoid global augmentation errors
export {};
