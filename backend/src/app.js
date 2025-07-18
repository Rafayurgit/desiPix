import express from "express";
import cors from "cors";
import imageRoutes from "./routes/image.route.js"

const app= express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.send("Welcome to DesiPix backend");
})

app.use("/upload", imageRoutes);

export default app;