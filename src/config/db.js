import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants.js";
import dotenv from "dotenv";
import logger from "../utils/logger.js"; // Import logger
dotenv.config();

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}${DB_NAME}`
    );
    logger.info(
      `\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host} `
    );
  } catch (error) {
    logger.error(`Database connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;