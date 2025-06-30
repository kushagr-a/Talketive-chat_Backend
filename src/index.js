import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

// User Import
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/messages.routes.js";

// import socketSetup from "./lib/socket.js";
// const { app, server, io } = socketSetup;

import { app, server, io } from "./lib/socket.js";

const PORT = process.env.PORT || 5000;

//  const app = express()

app.use(express.json({ limit: "20mb" })); // Increase limit for image uploads
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://talketive-chat-frontend-eijy.vercel.app/",
    ], // Allow local and deployed frontend origins
    credentials: true,
  })
);

// health check
app.get("/", (req, res) => {
  res.send("Hello check");
});

// Routes
app.use("/api/auth", authRoutes);

// message routes
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   connectDB();
// });
