import { convertImageFormat } from "../services/image.service"
import fs from fs;

export const convertImageController = async (req,res)=>{

    const file = req.file;
    const {format} =req.body;

    if(!file || !format){
        return res.status(400).json({message:"File and format are required"})
    }

    try {
        const outputPath = await convertImageFormat(file.path, format);
        res.download(outputPath, `converted.${format}`, (error)=>{
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


