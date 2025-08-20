// services/ico.service.js
import sharp from "sharp";
import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = util.promisify(exec);

// Standard multi-res sizes for Windows ICO
const iconSizes = [256, 128, 64, 48, 32, 16];

export async function convertToIco(inputPath) {
  const tempDir = path.dirname(inputPath);
  const basename = path.basename(inputPath, path.extname(inputPath));

  const resizedPaths = [];

  try {
    // Generate all required PNGs
    for (const size of iconSizes) {
      const resizedPath = path.join(tempDir, `${basename}-${size}.png`);

      await sharp(inputPath)
        .resize(size, size, {
          fit: "cover", // guarantee exact square size
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent padding
        })
        .png({ compressionLevel: 0 }) // uncompressed PNGs for ICO safety
        .toFile(resizedPath);

      resizedPaths.push(resizedPath);
    }

    // Define ICO output path
    const outputPath = path.join(tempDir, `${basename}.ico`);

    // Combine PNGs into a multi-res ICO
    // Note: no need for -define icon:auto-resize=0 → magick handles it
    const cmd = `magick ${resizedPaths.join(" ")} "${outputPath}"`;
    await execAsync(cmd);

    return outputPath;
  } finally {
    // Cleanup temp resized PNGs
    await Promise.all(
      resizedPaths.map(async (file) => {
        try {
          await fs.unlink(file);
        } catch {}
      })
    );
  }
}
