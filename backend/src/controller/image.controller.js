import { converImageFormat } from "../services/image.service"

export const convertImageController = async (req,res)=>{

    const file = req.file;
    const {format} =req.body;

    if(!file || !format){
        return res.staus(400),json({message:"File and format are required"})
    }

    try {
        const outputPath = await converImageFormat(file.path, format);
        res.download(outputPath, `converted.${format}`);
    } catch (error) {
        console.log("error: conversion failed", error.message);
        res.staus(500).json({message:"Failed to convert image"})
    }
};


