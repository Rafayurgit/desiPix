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
  const normalizedInputPath = path.resolve(inputPath);
  const outputPath = normalizedInputPath + "." + outputFormat;
  const normalizedOutputPath = path.resolve(outputPath);

  let command;
  if (outputFormat === 'ico') {
    command = `magick "${normalizedInputPath}" -resize 256x256 -define icon:auto-resize=256,128,64,48,32,16 "${normalizedOutputPath}"`;
  } else {
    command = `magick "${normalizedInputPath}" -quality 85 "${normalizedOutputPath}"`;
  }

  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) console.log("ImageMagick stderr:", stderr);
    return normalizedOutputPath;
  } catch (error) {
    console.log("ImageMagick command failed:", error);
    throw error;
  }
}

