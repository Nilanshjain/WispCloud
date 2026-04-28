import mongoose from "mongoose";
import { logger } from "./logger.js";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info({ host: conn.connection.host, db: conn.connection.name }, "MongoDB connected");
    } catch (error) {
        logger.error({ err: error }, "MongoDB connection error");
        throw error;
    }
};