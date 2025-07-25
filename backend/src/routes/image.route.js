import express from "express";
import multer from "multer";
import {    convertImageController } from "../controller/image.controller.js"

const router= express.Router();

const upload = multer({dest: "uploads/"});
router.post("/", upload.single("Image"), convertImageController);

export default router;