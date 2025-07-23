// import { convertImageFormat } from "../services/image.service.js";
import {convertImageFormat} from "../services/image.service.js"
import fs from "fs";

export const convertImageController = async (req,res)=>{

    const file = req.file;
    const {Format} =req.body;

    

    if(!file || !Format){
        return res.status(400).json({message:"File and format are required"})
    }

    try {
        const outputPath = await convertImageFormat(file.path, Format);

        if(!fs.existsSync(outputPath)){
            return res.status(500).json({message:"Conversion failed : Output not found"})
        }

        
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


