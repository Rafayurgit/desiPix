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

  if (detectedInputFormat === "ico" && outputFormat !== "ico") {
    return await robustIcoConvert(inputPath, outputFormat);
  }

  // 2. ICO as OUTPUT (never direct ImageMagick):
  if (outputFormat === "ico") {
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
    ["jpeg", "jpg", "png", "bmp"].includes(detectedInputFormat) &&
    outputFormat === "svg"
  ) {
    return await rasterToSvg(inputPath);
  }

  if (detectedInputFormat === "svg") {
    return await convertSVGtoRaster(inputPath, outputFormat);
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
