import sharp from "sharp";
import path from "path";
import fs from "fs";


export const convertImageFormat = async (inputPath, targetFormat)=>{
    const outputPath = inputPath+"."+targetFormat;

    await sharp(inputPath).toFormat(targetFormat).toFile(outputPath);
    return outputPath;
}