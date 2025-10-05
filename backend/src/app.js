// import dotenv from "dotenv";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import imageRoutes from "./routes/image.route.js"
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
const app= express();
// dotenv.config({})
// app.use(cors({origin : process.env.FRONTEND_URL }));
app.use(cors());
app.use(express.json());
app.use(cookieParser());


connectDB();


app.get("/", (req,res)=>{
    res.send("Welcome to PhotoJugaad backend");
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/upload", imageRoutes);
app.use("/auth", authRoutes);
console.log("Serving static files from:", path.join(__dirname, "..", "uploads"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

export default app;