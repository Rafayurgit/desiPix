import sharp from "sharp";
import path from "path";
import fs from "fs";
import { convertHEIC } from "./heic.service.js";


// export const convertImageFormat = async (inputPath, targetFormat) => {
//   const ext = inputPath.split(".").pop().toLowerCase();
//   const supportedSharpFormats = Object.keys(sharp.format).filter(
//     (key) => sharp.format[key].output === true
//   );

//   if (ext === "heic" || ext === "heif") {
//     // Delegate HEIC/HEIF to ImageMagick
//     return await convertHEIC(inputPath, targetFormat);
//   }

//   if (!supportedSharpFormats.includes(targetFormat)) {
//     throw new Error(`Unsupported format for conversion: ${targetFormat}`);
//   }

//   const outputPath = inputPath + "." + targetFormat;
//   await sharp(inputPath).toFormat(targetFormat).toFile(outputPath);
//   return outputPath;
// };


// export const convertImageFormat = async (inputPath, targetFormat)=>{
//     console.log("Supported formats:", sharp.format);
//     const ext = inputPath.split(".").pop().toLowerCase();
//     if (ext === "heic" || ext === "heif") {
//     return await convertHEIC(inputPath, targetFormat);
//   }

//     const outputPath = inputPath+"."+targetFormat;

//     await sharp(inputPath).toFormat(targetFormat).toFile(outputPath);
//     return outputPath;
// }

console.log("Sharp supported output formats:", Object.entries(sharp.format).filter(([key,val]) => val.output).map(([key]) => key));

export const convertImageFormat = async (inputPath, targetFormat, inputExt) => {
  const format = targetFormat.toLowerCase();
  console.log("Normalized format:", format);

  if(format === 'jpg'){
    format = 'jpeg'
  }

  // const ext = inputPath.split(".").pop().toLowerCase();
  const ext = inputExt.toLowerCase();
  console.log("Input file extension:", ext);

  const supportedSharpFormats = Object.keys(sharp.format).filter(
    (key) => sharp.format[key].output === true
  );

  if (ext === "heic" || ext === "heif") {
    return await convertHEIC(inputPath, format);
  }

  if (!supportedSharpFormats.includes(format)) {
    throw new Error(`Unsupported format for conversion: ${format}`);
  }

  const outputPath = inputPath + "." + format;
  await sharp(inputPath).toFormat(format).toFile(outputPath);
  return outputPath;
};
