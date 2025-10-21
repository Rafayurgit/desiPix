import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import imageRoutes from "./routes/image.route.js";

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Rate limiter for auth routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to PhotoJugaad backend");
});

app.use("/upload", imageRoutes);
app.use("/api/v1/auth", authRateLimiter, authRoutes);

// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Serving static files from:", path.join(__dirname, "..", "uploads"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

export default app;