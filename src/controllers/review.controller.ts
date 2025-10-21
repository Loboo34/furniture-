import { Request, Response } from "express";

import Review from "../models/reviews.models";
import Product from "../models/product.models";
import { logger } from "../utils/logger";

export const leaveReview = async (req: Request, res: Response) => {
    const userId = req.user?.id
    const {  product, content, stars } = req.body;
    try {
        const prod = await Product.findById(product)
        if(!prod) {
            res.status(400).json({success: false, message: "Product not found"})
            return
        }
        const review = new Review ({
            product,
            content,
            stars: typeof stars === "number" ? stars : undefined,
            ...(userId ? {user: userId}: {})
        })

        await review.save()

        prod.reviewCount = (prod.reviewCount ?? 0) + 1;
        logger.info("Review")
        await prod.save()
        return res.status(201).json({success: true, review})
    } catch (err) {
        logger.error("Falied to leave comment");
        res.status(500).json({ message: "Server Error" });
    }
};


export const getReviews = async (req:Request, res:Response) => {
    try
        {const reviews = await Review.find()
        res.status(200).json({success: true, reviews})
    } catch(err){
        logger.error("Failed to fetch reviews")
        res.status(500).json({message: "Server Error"})
    }
}

export const getReviewsByProduct = async (req: Request, res: Response) => {
    const {product} = req.params
	try {
		const reviews = await Review.find({product})
        .populate("user", "name")
        .populate("product", "name")
		res.status(200).json({ success: true, reviews });
	} catch (err) {
		logger.error("Failed to fetch reviews");
		res.status(500).json({ message: "Server Error" });
	}
};


