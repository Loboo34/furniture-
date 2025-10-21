import axios from "axios";
import { Request, Response } from "express";
import { Buffer } from "buffer";
import { logger } from "../utils/logger";
import { getAccessToken } from "./token";
import MpesaTransaction from "../models/mpesa.models";

const envRequired = ["PASS_KEY", "BASE_URL"];

const generateTimestamp = () => {
	return new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14);
};

const shortCode = 174379; // Example shortcode, replace with actual
const PASS_KEY = process.env.PASS_KEY;

async function initiatePayment({
	amount,
	products,
	phoneNumber,
	accountReference,
	transactionDesc,
}: {
	amount: number;
	products?: any[];
	phoneNumber: string;
	accountReference?: string;
	transactionDesc?: string;
}) {
	try {
		const accessToken = await getAccessToken();
		if (!accessToken) {
			logger.error("Failed to retrieve access token");
			return;
		}

		const timestamp = generateTimestamp();
		const headers = {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		};

		const payload = {
			BusinessShortCode: shortCode,
			Password: Buffer.from(`${shortCode}${PASS_KEY}${timestamp}`).toString(
				"base64"
			),
			Timestamp: timestamp,
			TransactionType: "CustomerPayBillOnline",
			Amount: amount,
			PartyA: phoneNumber,
			PartyB: shortCode,
			PhoneNumber: phoneNumber,
			CallBackURL: `${process.env.BASE_URL}/api/v1/mpesa/callback`,
			AccountReference: accountReference || "BakersApp",
			TransactionDesc: transactionDesc || "Payment for goods/services",
			Metadata: products
				? products.map((product) => ({
						ProductName: product.name,
						Quantity: product.quantity,
						Price: product.price,
				  }))
				: [],
		};

		const response = await axios.post(
			"https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
			payload,
			{ headers }
		);

		return response.data;
	} catch (error) {
		logger.error("Error initiating payment", error);
		return { error: "Failed to initiate payment" };
	}
}

export const mpesaController = {
	initiatePayment,

	async getTransactions(req: Request, res: Response) {
		try {
			const transactions = await MpesaTransaction.find();
			return res.status(200).json(transactions);
		} catch (error) {
			logger.error("Error fetching transactions", error);
			return res.status(500).json({ error: "Failed to fetch transactions" });
		}
	},
};
