import express from "express";
import multer from "multer";

const router= express.Router();

const upload = multer({dest: "/upload"});
router.post("/upload", upload.single("image"), convertImageController);

export default router;