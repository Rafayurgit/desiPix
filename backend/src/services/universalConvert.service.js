import sharp from "sharp";
import { fileTypeFromFile } from "file-type";
import { convertHEIC } from "./heic.service.js";
import fs from "fs/promises";
import path from "path";
import { canUseImageMagick, convertWithImageMagick } from "./imagick.service.js";
import { convertSVGtoRaster } from "./svg.service.js";
import { isAnimatedFormat } from "./animated.service.js";
import { convertWithLogging } from "../utils/convertLogger.js";

export async function universalConvert(inputPath, requestedOutputFormat) {
  let fileType = await fileTypeFromFile(inputPath);
  let detectedInputFormat = fileType?.ext?.toLowerCase() ?? path.extname(inputPath).replace(".", "").toLowerCase();

  let outputFormat = requestedOutputFormat.toLowerCase();

  if (outputFormat === "jpg") outputFormat = "jpeg";
  if (outputFormat === "tif") outputFormat = "tiff";

  if(detectedInputFormat==="jpg") detectedInputFormat="jpeg";
  if(detectedInputFormat==="tif") detectedInputFormat="tiff";


  if (["heic", "heif"].includes(detectedInputFormat)) {
    if (["jpeg", "png"].includes(outputFormat)) {
      return await convertWithLogging("HeicConvert", convertHEIC, inputPath, outputFormat);
    }

    // HEIC fallback: heic -> png -> desired format
    let tempPNG = await convertHEIC(inputPath, "png");
    let outPath = tempPNG + "." + outputFormat;

    try {
      await sharp(tempPNG).toFormat(outputFormat).toFile(outPath);
    } finally {
        try {
            await fs.unlink(tempPNG);
        } catch (error) {
        console.error("Failed to delete temp PNG file:", err);            
        }
      // Clean up temp PNG file
    }
    return outPath;
  }

  let supportedSharpInputs = Object.keys(sharp.format).filter(k => sharp.format[k].input);
  let supportedSharpOutputs = Object.keys(sharp.format).filter(k => sharp.format[k].output);

  if (supportedSharpInputs.includes(detectedInputFormat) && supportedSharpOutputs.includes(outputFormat)) {
    return await convertWithLogging("sharp", async(inputPath, outputFormat)=>{

      let outputPath = inputPath + "." + outputFormat;
      await sharp(inputPath).toFormat(outputFormat).toFile(outputPath);
      return outputPath;

    },inputPath, outputFormat)

    
  }

  if(canUseImageMagick(detectedInputFormat, outputFormat)){
    return await convertWithLogging("ImageMagic", convertWithImageMagick, inputPath, outputFormat)
  }

  if(detectedInputFormat ==="svg"){
    return await convertSVGtoRaster(inputPath, outputFormat)
  }

  if(isAnimatedFormat(detectedInputFormat)){
    return await convertAnimatedFormat(inputPath, outputFormat);
  }

  
  
throw new Error(`Conversion from ${detectedInputFormat} to ${outputFormat} not yet supported.`);
  
}
