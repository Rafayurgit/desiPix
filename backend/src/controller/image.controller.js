// import { convertImageFormat } from "../services/image.service.js";
import fs, { readFileSync } from "fs";
import crypto from "crypto";
import {convertImageFormat} from "../services/image.service.js"


export const convertImageController = async (req,res)=>{

    const processedImages = new Set();

    const getFileHash =(filepath)=>{
        const fileBuffer = fs.readFileSync(filepath);
        const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
        return hash;
    }

    const file = req.file;
    const {Format} =req.body;

    if(!file || !Format){
        return res.status(400).json({message:"File and format are required"})
    }

    try {
        const fileHash = getFileHash(file.path);
        const uniqueKey = `${fileHash}_${Format}`;

        if(processedImages.has(uniqueKey)){
            fs.unlinkSync(file.path)
            return res.status(409).json({message:"Image has already been converted to this format."})
        }

        const outputPath = await convertImageFormat(file.path, Format);

        if(!fs.existsSync(outputPath)){
            return res.status(500).json({message:"Conversion failed : Output not found"})
        }

        processedImages.add(uniqueKey)
        
        res.download(outputPath, `converted.${Format}`, (error)=>{
            if(!error){
                fs.unlinkSync(file.path)
                fs.unlinkSync(outputPath)
            }else{
                console.log(error,  "Download failed");
            }
        });

        

    } catch (error) {
        console.log("error: conversion failed", error.message);
        res.status(500).json({message:"Failed to convert image"})
    }
};


