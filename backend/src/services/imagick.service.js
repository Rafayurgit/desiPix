import { exec } from "child_process";
import util from "util";
import path from "path";

const execAsync = util.promisify(exec);

export function canUseImageMagick(inputFormat, outputFormat) {
  const supported = new Set([
    "tiff", "tif", "gif", "bmp", "ico", "svg", "pdf", "webp" // etc.
  ]);
  return supported.has(inputFormat) || supported.has(outputFormat);
}

export async function convertWithImageMagick(inputPath, outputFormat) {
  const outputPath = inputPath + "." + outputFormat;
  const command = `magick convert "${inputPath}" "${outputPath}"`;
  await execAsync(command);
  return outputPath;
}
