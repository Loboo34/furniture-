import axios from "axios";
import { Buffer } from "buffer";
import {logger} from "../utils/logger";

interface TokenCache {
    token: string;
    expiry: number;
}

let tokenCache: TokenCache = {
    token: '',
    expiry: 0
};

const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;

const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

export const getAccessToken = async () => {
    try{
        if (tokenCache.token && tokenCache.expiry > Date.now()) {
            logger.info("Using cached access token");
            return tokenCache.token;
        }
        logger.info("Fetching new access token");
        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        if (response.status !== 200) {
            throw new Error("Failed to get access token");
        }

        tokenCache = {
            token: response.data.access_token,
            expiry: Date.now() + response.data.expires_in * 1000 

        }

        logger.info("Access token retrieved successfully");
        return response.data.access_token;
    } catch(error: any) {
        logger.error(`Error getting access token: ${error.message}`);
        throw new Error("Failed to get access token");
    }
}   