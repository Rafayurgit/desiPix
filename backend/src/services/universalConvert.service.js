import sharp from "sharp";
import { fileTypeFromFile } from "file-type";
import { convertHEIC } from "./heic.service.js";
import fs from "fs/promises";
import path from "path";
import {
  canUseImageMagick,
  convertWithImageMagick,
} from "./imagick.service.js";
import { convertSVGtoRaster } from "./svg.service.js";
import { isAnimatedFormat } from "./animated.service.js";
import { convertWithLogging } from "../utils/convertLogger.js";
import { rasterToSvg } from "../utils/rasterToSvg.js";
import { convertToIco } from "./ico.service.js";
import { robustIcoConvert } from "./robustIcoConvert.js";
import { convertAnimatedFormat } from "./animated.service.js";

/*
export async function universalConvert(inputPath, requestedOutputFormat) {
  let fileType = await fileTypeFromFile(inputPath);
  let detectedInputFormat =
    fileType?.ext?.toLowerCase() ??
    path.extname(inputPath).replace(".", "").toLowerCase();
    

  let outputFormat = requestedOutputFormat.toLowerCase();

  if (outputFormat === "jpg") outputFormat = "jpeg";
  if (outputFormat === "tif") outputFormat = "tiff";

  if (detectedInputFormat === "jpg") detectedInputFormat = "jpeg";
  if (detectedInputFormat === "tif") detectedInputFormat = "tiff";

  if (detectedInputFormat === "xml") detectedInputFormat = "svg";
  

  if (detectedInputFormat === "ico" && outputFormat !== "ico") {
    return await robustIcoConvert(inputPath, outputFormat);
  }

  // 2. ICO as OUTPUT (never direct ImageMagick):
  // if (outputFormat === "ico") {
  //   return await convertToIco(inputPath);
  // }
  if (outputFormat === "ico") {
  if (["bmp", "tiff"].includes(detectedInputFormat)) {
    const tempPng = inputPath + ".png";
    await sharp(inputPath).toFormat("png").toFile(tempPng);
    return await convertToIco(tempPng);
  }
  return await convertToIco(inputPath);
}


  if (["heic", "heif"].includes(detectedInputFormat)) {
    if (["jpeg", "png"].includes(outputFormat)) {
      return await convertWithLogging(
        "HeicConvert",
        convertHEIC,
        inputPath,
        outputFormat
      );
    }

    // HEIC fallback: heic -> png -> desired format
    let tempPNG = await convertHEIC(inputPath, "png");
    let outPath = tempPNG + "." + outputFormat;

    if (outputFormat === "svg") {
      let svgPath = await rasterToSvg(tempPNG);
      try {
        await fs.unlink(tempPNG);
      } catch (e) {}
      return svgPath;
    }

    // if (outputFormat === "ico") {
    //   // Use your special multi-res ICO generator
    //   return await convertToIco(inputPath);
    // } else {
    //   // Use sharp or ImageMagick normally
    //   return await convertWithImageMagick(inputPath, outputFormat);
    // }
    // if(outputFormat ==="ico"){
    //   const icoPath = await convertWithImageMagick(tempPNG, "ico");
    //   try{await fs.unlink(tempPNG)} catch(e){}
    //   return icoPath;
    // }

    try {
      await sharp(tempPNG).toFormat(outputFormat).toFile(outPath);
    } finally {
      try {
        await fs.unlink(tempPNG);
      } catch (error) {
        console.error("Failed to delete temp PNG file:", error);
      }
      // Clean up temp PNG file
    }

    return outPath;
  }

  // AVIF special case
  if (
    outputFormat === "avif" &&
    ["png", "jpeg", "jpg"].includes(detectedInputFormat)
  ) {
    const outPath = inputPath + ".avif";
    try {
      await sharp(inputPath).toFormat("avif", { quality: 50 }).toFile(outPath);
      return outPath;
    } catch (err) {
      console.warn(
        "Sharp AVIF failed, falling back to ImageMagick:",
        err.message
      );
      return await convertWithImageMagick(inputPath, "avif");
    }
  }

  if (
    detectedInputFormat === "avif" &&
    ["png", "jpeg"].includes(outputFormat)
  ) {
    let outPath = inputPath + "." + outputFormat;
    await sharp(inputPath).toFormat(outputFormat).toFile(outPath);
    return outPath;
  }
  // AVIF -> HEIC (requires ImageMagick with libheif support)
// if (detectedInputFormat === "avif" && outputFormat === "heic") {
//   return await convertWithLogging(
//     "ImageMagick",
//     convertWithImageMagick,
//     inputPath,
//     outputFormat
//   );
// }
if (detectedInputFormat === "avif" && outputFormat === "heic") {
  try {
    return await convertWithLogging(
      "ImageMagick",
      convertWithImageMagick,
      inputPath,
      outputFormat
    );
  } catch (err) {
    console.warn("HEIC encode not supported in this environment:", err.message);

    // fallback (so frontend doesn't crash with null url)
    const fallbackPath = inputPath + ".jpeg";
    await sharp(inputPath).toFormat("jpeg").toFile(fallbackPath);
    return fallbackPath;
  }
}


  if (
    ["jpeg", "jpg", "png", "bmp", "gif", "webp", "tiff"].includes(detectedInputFormat) &&
    outputFormat === "svg"
  ) {
    return await rasterToSvg(inputPath);
  }

  // if (detectedInputFormat === "svg") {
  //   return await convertSVGtoRaster(inputPath, outputFormat);
  // }
  if (detectedInputFormat === "svg") {
  if (["png", "jpeg", "webp"].includes(outputFormat)) {
    try {
      return await convertSVGtoRaster(inputPath, outputFormat);
    } catch (err) {
      console.error(`SVG to ${outputFormat} conversion error:`, err);
      throw new Error(`Conversion from SVG to ${outputFormat} failed: ${err.message}`);
    }
  }
  if (outputFormat === "avif") {
    try {
      const tempPng = await convertSVGtoRaster(inputPath, "png");
      const avifPath = tempPng + ".avif";
      await sharp(tempPng).toFormat("avif", { quality: 50 }).toFile(avifPath);
      await fs.unlink(tempPng);
      return avifPath;
    } catch (err) {
      console.error(`SVG to AVIF conversion error:`, err);
      throw new Error(`Conversion from SVG to AVIF failed: ${err.message}`);
    }
  }
}


  let supportedSharpInputs = Object.keys(sharp.format).filter(
    (k) => sharp.format[k].input
  );
  let supportedSharpOutputs = Object.keys(sharp.format).filter(
    (k) => sharp.format[k].output
  );

  if (
    supportedSharpInputs.includes(detectedInputFormat) &&
    supportedSharpOutputs.includes(outputFormat)
  ) {
    return await convertWithLogging(
      "sharp",
      async (inputPath, outputFormat) => {
        let outputPath = inputPath + "." + outputFormat;
        await sharp(inputPath).toFormat(outputFormat).toFile(outputPath);
        return outputPath;
      },
      inputPath,
      outputFormat
    );
  }

  if (canUseImageMagick(detectedInputFormat, outputFormat)) {
    return await convertWithLogging(
      "ImageMagic",
      convertWithImageMagick,
      inputPath,
      outputFormat
    );
  }

  if (isAnimatedFormat(detectedInputFormat)) {
    return await convertAnimatedFormat(inputPath, outputFormat);
  }

  throw new Error(
    `Conversion from ${detectedInputFormat} to ${outputFormat} not yet supported.`
  );
}
  */

export async function universalConvert(inputPath, requestedOutputFormat) {
  let fileType = await fileTypeFromFile(inputPath);
  let detectedInputFormat;
  
  // Better format detection for SVG files
  if (!fileType) {
    const ext = path.extname(inputPath).replace(".", "").toLowerCase();
    if (ext === 'svg') {
      // Verify it's actually an SVG by checking content
      try {
        const content = await fs.readFile(inputPath, 'utf8');
        if (content.includes('<svg') || content.includes('<?xml')) {
          detectedInputFormat = 'svg';
        }
      } catch (error) {
        console.error('Error reading potential SVG file:', error);
      }
    }
    detectedInputFormat = detectedInputFormat || ext;
  } else {
    detectedInputFormat = fileType.ext?.toLowerCase();
  }

  let outputFormat = requestedOutputFormat.toLowerCase();

  // Normalize format names
  if (outputFormat === "jpg") outputFormat = "jpeg";
  if (outputFormat === "tif") outputFormat = "tiff";
  if (detectedInputFormat === "jpg") detectedInputFormat = "jpeg";
  if (detectedInputFormat === "tif") detectedInputFormat = "tiff";

  console.log(`Converting from ${detectedInputFormat} to ${outputFormat}`);

  // Handle ICO input conversions
  if (detectedInputFormat === "ico" && outputFormat !== "ico") {
    return await convertWithLogging(
      "ICO-Converter",
      robustIcoConvert,
      inputPath,
      outputFormat
    );
  }

  // Handle ICO output conversions
  if (outputFormat === "ico") {
    return await convertWithLogging(
      "ICO-Generator",
      convertToIco,
      inputPath
    );
  }

  // Handle HEIC/HEIF input conversions
  if (["heic", "heif"].includes(detectedInputFormat)) {
    if (["jpeg", "png"].includes(outputFormat)) {
      return await convertWithLogging(
        "HeicConvert",
        convertHEIC,
        inputPath,
        outputFormat
      );
    }

    // HEIC fallback: heic -> png -> desired format
    let tempPNG = await convertHEIC(inputPath, "png");
    let outPath = tempPNG + "." + outputFormat;

    if (outputFormat === "svg") {
      let svgPath = await rasterToSvg(tempPNG);
      try {
        await fs.unlink(tempPNG);
      } catch (e) {}
      return svgPath;
    }

    try {
      await sharp(tempPNG).toFormat(outputFormat).toFile(outPath);
    } finally {
      try {
        await fs.unlink(tempPNG);
      } catch (error) {
        console.error("Failed to delete temp PNG file:", error);
      }
    }

    return outPath;
  }

  // Handle SVG input conversions - IMPROVED
  if (detectedInputFormat === "svg") {
    return await convertWithLogging(
      "SVG-Converter",
      convertSVGtoRaster,
      inputPath,
      outputFormat
    );
  }

  // Handle SVG output conversions
  if (["jpeg", "jpg", "png", "bmp"].includes(detectedInputFormat) && outputFormat === "svg") {
    return await convertWithLogging(
      "Raster-to-SVG",
      rasterToSvg,
      inputPath
    );
  }

  // Enhanced AVIF handling
  if (outputFormat === "avif") {
    const outPath = inputPath + ".avif";
    
    try {
      let sharpInstance = sharp(inputPath);
      
      // Special handling for different input formats
      if (detectedInputFormat === "svg") {
        sharpInstance = sharpInstance.density(300);
      }
      
      await sharpInstance
        .avif({ 
          quality: 80, 
          effort: 4,
          chromaSubsampling: '4:4:4' // Better quality
        })
        .toFile(outPath);
      
      return outPath;
    } catch (err) {
      console.warn("Sharp AVIF failed, trying ImageMagick fallback:", err.message);
      try {
        return await convertWithImageMagick(inputPath, "avif");
      } catch (imagickErr) {
        console.error("ImageMagick AVIF also failed:", imagickErr.message);
        throw new Error(`AVIF conversion failed: ${err.message}`);
      }
    }
  }

  // Handle AVIF input conversions
  if (detectedInputFormat === "avif" && ["png", "jpeg"].includes(outputFormat)) {
    let outPath = inputPath + "." + outputFormat;
    await sharp(inputPath).toFormat(outputFormat).toFile(outPath);
    return outPath;
  }

  // AVIF to HEIC conversion
  if (detectedInputFormat === "avif" && outputFormat === "heic") {
    try {
      return await convertWithLogging(
        "ImageMagick",
        convertWithImageMagick,
        inputPath,
        outputFormat
      );
    } catch (err) {
      console.warn("HEIC encode not supported in this environment:", err.message);
      // Fallback to JPEG
      const fallbackPath = inputPath + ".jpeg";
      await sharp(inputPath).toFormat("jpeg").toFile(fallbackPath);
      return fallbackPath;
    }
  }

  // Check Sharp compatibility
  let supportedSharpInputs = Object.keys(sharp.format).filter(
    (k) => sharp.format[k].input
  );
  let supportedSharpOutputs = Object.keys(sharp.format).filter(
    (k) => sharp.format[k].output
  );

  // Use Sharp for supported conversions (but exclude SVG output since Sharp doesn't support it)
  if (
    supportedSharpInputs.includes(detectedInputFormat) &&
    supportedSharpOutputs.includes(outputFormat) &&
    outputFormat !== "svg" // Sharp cannot output SVG
  ) {
    return await convertWithLogging(
      "Sharp",
      async (inputPath, outputFormat) => {
        let outputPath = inputPath + "." + outputFormat;
        
        let sharpInstance = sharp(inputPath);
        
        // Apply format-specific options
        switch (outputFormat) {
          case 'jpeg':
            sharpInstance = sharpInstance.jpeg({ quality: 90, progressive: true });
            break;
          case 'png':
            sharpInstance = sharpInstance.png({ compressionLevel: 6 });
            break;
          case 'webp':
            sharpInstance = sharpInstance.webp({ quality: 90, effort: 4 });
            break;
          case 'avif':
            sharpInstance = sharpInstance.avif({ quality: 80, effort: 4 });
            break;
          case 'tiff':
            sharpInstance = sharpInstance.tiff({ compression: 'lzw' });
            break;
          default:
            sharpInstance = sharpInstance.toFormat(outputFormat);
        }
        
        await sharpInstance.toFile(outputPath);
        return outputPath;
      },
      inputPath,
      outputFormat
    );
  }

  // Use ImageMagick as fallback
  if (canUseImageMagick(detectedInputFormat, outputFormat)) {
    return await convertWithLogging(
      "ImageMagick",
      convertWithImageMagick,
      inputPath,
      outputFormat
    );
  }

  // Handle animated formats
  if (isAnimatedFormat(detectedInputFormat)) {
    return await convertWithLogging(  
      "Animated-Converter",
      convertAnimatedFormat,
      inputPath,
      outputFormat
    );
  }

  throw new Error(
    `Conversion from ${detectedInputFormat} to ${outputFormat} is not yet supported. Please try a different format combination.`
  );
}
