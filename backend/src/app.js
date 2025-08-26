import express from "express";
import cors from "cors";
import imageRoutes from "./routes/image.route.js"
import path from "path";
import { fileURLToPath } from "url";

const app= express();

// app.use(cors({origin : process.env.FRONTEND_URL }));
app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.send("Welcome to DesiPix backend");
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/upload", imageRoutes);
console.log("Serving static files from:", path.join(__dirname, "..", "uploads"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

export default app;