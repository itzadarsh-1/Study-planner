import mongoose from "mongoose";
import app from "./app.js";
import { ENV } from "./config/env.js";

// Reuse a single MongoDB connection across warm serverless invocations
let connection;
export const connectDB = () => {
    if (!connection) {
        connection = mongoose.connect(ENV.MONGODB_URI).catch((error) => {
            connection = undefined;
            throw error;
        });
    }
    return connection;
};

export default app;
