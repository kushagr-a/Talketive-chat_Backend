import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB connnected: ${connect.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection failed", error);
  }
};
