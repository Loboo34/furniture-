import { Request, Response } from "express";

import Review from "../models/reviews.models";
import Product from "../models/product.models";
import { logger } from "../utils/logger";

export const leaveReview = async (req: Request, res: Response) => {
	const userId = req.user?.id;
	const { product, content, stars } = req.body;
    if(!userId) {
        res.status(401).json({
            success: false,
            message: "Authentication required"
        })
    }
	try {
		const prod = await Product.findById(product);
		if (!prod) {
			res.status(400).json({ success: false, message: "Product not found" });
			return;
		}
		const review = new Review({
            user: userId,
			product,
			content,
			stars: typeof stars === "number" ? stars : undefined,
			...(userId ? { user: userId } : {}),
		});

		await review.save();

		prod.reviewCount = (prod.reviewCount ?? 0) + 1;
		logger.info("Review");
		await prod.save();
		return res.status(201).json({ success: true, review });
	} catch (err) {
		logger.error("Falied to leave comment");
		res.status(500).json({ message: "Server Error" });
	}
};

export const getReviews = async (req: Request, res: Response) => {
	try {
		const reviews = await Review.find();
		res.status(200).json({ success: true, reviews });
	} catch (err) {
		logger.error("Failed to fetch reviews");
		res.status(500).json({ message: "Server Error" });
	}
};

export const getReviewsByProduct = async (req: Request, res: Response) => {
	const { product } = req.params;
	try {
		const reviews = await Review.find({ product })
			.populate("user", "name")
			.populate("product", "name");
		res.status(200).json({ success: true, reviews });
	} catch (err) {
		logger.error("Failed to fetch reviews");
		res.status(500).json({ message: "Server Error" });
	}
};

export const getReviewsBySeller = async (req: Request, res: Response) => {
	const sellerId = req.params.sellerId ?? req.user?.id;

	if (!sellerId) {
		return res.status(400).json({
			success: false,
			message: "Seller ID required",
		});
	}

	try {
		// First, find all products belonging to this seller
		const sellerProducts = await Product.find({ seller: sellerId })
			.select("_id")

		if (!sellerProducts || sellerProducts.length === 0) {
			return res.status(200).json({
				success: true,
				reviews: [],
				message: "No products found for this seller",
			});
		}

		// Extract product IDs
		const productIds = sellerProducts.map((p) => p._id);

		// Find all reviews for these products
		const reviews = await Review.find({ product: { $in: productIds } })
			.populate("user", "fullName email")
			.populate("product", "name image price")
			.sort({ createdAt: -1 })
			.lean();

		// Format the response
		const formattedReviews = reviews.map((review) => ({
			id: review._id.toString(),
			product: review.product,
			user: review.user,
			content: review.content,
			stars: review.stars,
			createdAt: review.createdAt,
			updatedAt: review.updatedAt,
		}));

		return res.status(200).json({
			success: true,
			count: formattedReviews.length,
			reviews: formattedReviews,
		});
	} catch (err) {
		logger.error("Failed to fetch reviews for seller", err);
		return res.status(500).json({
			success: false,
			message: "Server Error",
		});
	}
};
