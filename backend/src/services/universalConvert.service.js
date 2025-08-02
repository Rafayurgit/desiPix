import sharp from "sharp";
import { fileTypeFromFile } from "file-type";
import { convertHEIC } from "./heic.service.js";
import fs from "fs/promises";
import path from "path";
import { canUseImageMagick, convertWithImageMagick } from "./imagick.service.js";
import { convertSVGtoRaster } from "./svg.service.js";
import { isAnimatedFormat } from "./animated.service.js";

export async function universalConvert(inputPath, requestedOutputFormat) {
  const fileType = await fileTypeFromFile(inputPath);
  const detectedInputFormat = fileType?.ext?.toLowerCase() ?? path.extname(inputPath).replace(".", "").toLowerCase();

  let outputFormat = requestedOutputFormat.toLowerCase();
  if (outputFormat === "jpg") outputFormat = "jpeg";
  if (outputFormat === "tif") outputFormat = "tiff";


  if (["heic", "heif"].includes(detectedInputFormat)) {
    if (["jpeg", "png"].includes(outputFormat)) {
      return await convertHEIC(inputPath, outputFormat);
    }

    // HEIC fallback: heic -> png -> desired format
    const tempPNG = await convertHEIC(inputPath, "png");
    const outPath = tempPNG + "." + outputFormat;

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

  const supportedSharpInputs = Object.keys(sharp.format).filter(k => sharp.format[k].input);
  const supportedSharpOutputs = Object.keys(sharp.format).filter(k => sharp.format[k].output);

  if (supportedSharpInputs.includes(detectedInputFormat) && supportedSharpOutputs.includes(outputFormat)) {
    const outputPath = inputPath + "." + outputFormat;
    await sharp(inputPath).toFormat(outputFormat).toFile(outputPath);
    return outputPath;
    
  }

  if(canUseImageMagick(detectedInputFormat, outputFormat)){
    return await convertWithImageMagick(inputPath, outputFormat);
  }

  if(detectedInputFormat ==="svg"){
    return await convertSVGtoRaster(inputPath, outputFormat)
  }

  if(isAnimatedFormat(detectedInputFormat)){
    return await convertAnimatedFormat(inputPath, outputFormat);
  }

  
  
throw new Error(`Conversion from ${detectedInputFormat} to ${outputFormat} not yet supported.`);
  
}
