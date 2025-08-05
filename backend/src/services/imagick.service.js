import { exec } from "child_process";
import util from "util";
import path from "path";
import { log } from "console";


const execAsync = util.promisify(exec);

export function canUseImageMagick(inputFormat, outputFormat) {
  const supported = new Set([
    "tiff", "tif", "gif", "bmp", "ico", "svg", "pdf", "webp",
    "jpeg", "jpg", "heic" // etc.
  ]);
  return supported.has(inputFormat) || supported.has(outputFormat);
}

export async function convertWithImageMagick(inputPath, outputFormat) {
  const outputPath = inputPath + "." + outputFormat;
  // const command = `magick convert "${inputPath}" "${outputPath}"`;
  const command = `magick convert "${inputPath}" -quality 85 "${outputPath}"`;

  try {
    const { stdout, stderr } = await execAsync(command);
    if(stderr) console.log("ImageMagick stderr:", stderr);
    return outputPath
    
  } catch (error) {
    console.log("ImageMagic command failed:", error);
    throw error;
  }
}
