import { v2 as cloudinary } from "cloudinary";

// Validate environment variables
const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KEY } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY) {
	throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({
	cloud_name: CLOUD_NAME,
	api_key: CLOUD_API_KEY,
	api_secret: CLOUD_SECRET_KEY,
});

export default cloudinary;
