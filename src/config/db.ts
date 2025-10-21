import mongoose from "mongoose";
import { logger } from "../utils/logger";

const mongoUri = process.env.MONGO_URI

if (!mongoUri){
    throw new Error("MONGOURI is not defined in the environment variables");
    
}

export const connectDB = async () =>{
    try{
       await mongoose.connect(mongoUri);
        logger.info("Connected to mongo successfully")
    } catch(err){
        logger.error("Monog connection failed", err)
        process.exit(1)
    }
}