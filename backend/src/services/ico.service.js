// services/ico.service.js
import sharp from "sharp";
import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = util.promisify(exec);

const iconSizes = [256, 128, 64, 48, 32, 16];

export async function convertToIco(inputPath) {
  const tempDir = path.dirname(inputPath);
  const basename = path.basename(inputPath, path.extname(inputPath));
  
  const resizedPaths = [];

  try {
    // Resize input image to multiple sizes and save as PNG
    for (const size of iconSizes) {
      const resizedPath = path.join(tempDir, `${basename}-${size}.png`);
      await sharp(inputPath).resize(size, size).png().toFile(resizedPath);
      resizedPaths.push(resizedPath);
    }

    // Define output ICO path
    const outputPath = path.join(tempDir, `${basename}.ico`);

    // Use ImageMagick's magick CLI to combine PNGs into multi-res ICO
    // The -define icon:auto-resize disables auto resizing since we provide all sizes
    const cmd = `magick ${resizedPaths.join(" ")} -define icon:auto-resize=0 "${outputPath}"`;
    await execAsync(cmd);

    return outputPath;
  } finally {
    // Cleanup temp resized PNG files
    await Promise.all(
      resizedPaths.map(async (file) => {
        try {
          await fs.unlink(file);
        } catch {}
      })
    );
  }
}
