import sharp from "sharp";

export async function convertSVGtoRaster(inputPath, outputFormat) {
  const outputPath = inputPath + "." + outputFormat;
  await sharp(inputPath).toFormat(outputFormat).toFile(outputPath);
  return outputPath;
}
