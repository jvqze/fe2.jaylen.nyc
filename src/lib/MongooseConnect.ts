import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

declare global {
    let mongooseConnection: typeof mongoose.Connection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let connection: Promise<typeof mongoose>;

export default async function MongooseConnect() {
    if (mongoose.connections[0].readyState) {
        console.log("Mongoose is already connected.");
        return;
    }

    if (!connection) {
        connection = mongoose.connect(MONGODB_URI, {
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            autoIndex: process.env.NODE_ENV !== "production",
        });
    }

    try {
        await connection;
        console.log("Mongoose is connected to the database.");
    } catch (err) {
        console.error("Mongoose connection error:", err);
        throw new Error("Database connection failed");
    }
}