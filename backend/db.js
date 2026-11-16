import mongoose from "mongoose";
import { ENV } from "./config/env.js";

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!ENV.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(ENV.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((mongooseInstance) => {
        console.log(
          "MongoDB Connected:",
          mongooseInstance.connection.host
        );

        return mongooseInstance.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("MongoDB connection failed:", error);
        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;