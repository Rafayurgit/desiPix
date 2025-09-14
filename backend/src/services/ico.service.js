// services/ico.service.js
import sharp from "sharp";
import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";
import path from "path";
import { convertWithImageMagick } from "./imagick.service.js";

const execAsync = util.promisify(exec);

// Standard multi-res sizes for Windows ICO
const iconSizes = [256, 128, 64, 48, 32, 16];

// export async function convertToIco(inputPath) {
//   const tempDir = path.dirname(inputPath);
//   const basename = path.basename(inputPath, path.extname(inputPath));

//   const resizedPaths = [];

//   try {
//     // Generate all required PNGs
//     for (const size of iconSizes) {
//       const resizedPath = path.join(tempDir, `${basename}-${size}.png`);

//       await sharp(inputPath)
//         .resize(size, size, {
//           fit: "cover", // guarantee exact square size
//           background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent padding
//         })
//         .png({ compressionLevel: 0 }) // uncompressed PNGs for ICO safety
//         .toFile(resizedPath);

//       resizedPaths.push(resizedPath);
//     }

//     // Define ICO output path
//     const outputPath = path.join(tempDir, `${basename}.ico`);

//     // Combine PNGs into a multi-res ICO
//     // Note: no need for -define icon:auto-resize=0 → magick handles it
//     const cmd = `magick ${resizedPaths.join(" ")} "${outputPath}"`;
//     await execAsync(cmd);

//     return outputPath;
//   } finally {
//     // Cleanup temp resized PNGs
//     await Promise.all(
//       resizedPaths.map(async (file) => {
//         try {
//           await fs.unlink(file);
//         } catch {}
//       })
//     );
//   }
// }

// services/ico.service.js


export async function convertToIco(inputPath) {
  const tempDir = path.dirname(inputPath);
  const basename = path.basename(inputPath, path.extname(inputPath));
  const resizedPaths = [];

  try {
    // First, check if input format is supported by Sharp
    let workingInputPath = inputPath;
    const inputExt = path.extname(inputPath).toLowerCase();
    
    // If input is BMP, convert to PNG first since Sharp doesn't handle BMP well
    if (inputExt === '.bmp' || inputExt === '') {
      console.log("Detected BMP input, converting to PNG first...");
      try {
        // Use ImageMagick to convert BMP to PNG
        const tempPngPath = path.join(tempDir, `${basename}_temp.png`);
        const cmd = `magick "${inputPath}" "${tempPngPath}"`;
        await execAsync(cmd);
        workingInputPath = tempPngPath;
        resizedPaths.push(tempPngPath); // Add to cleanup list
        console.log("BMP to PNG conversion successful");
      } catch (bmpError) {
        console.error("Failed to convert BMP to PNG:", bmpError);
        // Fallback to direct ImageMagick ICO conversion
        return await convertWithImageMagick(inputPath, "ico");
      }
    }

    // Generate all required PNGs
    for (const size of iconSizes) {
      const resizedPath = path.join(tempDir, `${basename}-${size}.png`);

      try {
        await sharp(workingInputPath)
          .resize(size, size, {
            fit: "cover", // guarantee exact square size
            background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent padding
          })
          .png({ compressionLevel: 0 }) // uncompressed PNGs for ICO safety
          .toFile(resizedPath);

        resizedPaths.push(resizedPath);
      } catch (sharpError) {
        console.error(`Failed to create ${size}x${size} PNG:`, sharpError);
        // If Sharp fails, try ImageMagick fallback
        return await convertWithImageMagick(inputPath, "ico");
      }
    }

    // Define ICO output path
    const outputPath = path.join(tempDir, `${basename}.ico`);

    // Combine PNGs into a multi-res ICO (exclude the temp PNG from this step)
    const sizePngs = resizedPaths.filter(p => !p.includes('_temp.png'));
    const cmd = `magick ${sizePngs.map(p => `"${p}"`).join(" ")} "${outputPath}"`;
    console.log("Executing ICO creation command:", cmd);
    await execAsync(cmd);

    console.log("ICO conversion successful:", outputPath);
    return outputPath;
    
  } catch (error) {
    console.error("ICO conversion failed:", error);
    // Final fallback to direct ImageMagick conversion
    try {
      console.log("Trying direct ImageMagick ICO conversion as fallback...");
      return await convertWithImageMagick(inputPath, "ico");
    } catch (fallbackError) {
      throw new Error(`ICO conversion failed: ${error.message}. Fallback also failed: ${fallbackError.message}`);
    }
  } finally {
    // Cleanup temp resized PNGs
    await Promise.all(
      resizedPaths.map(async (file) => {
        try {
          await fs.unlink(file);
          console.log(`Cleaned up temp file: ${file}`);
        } catch (e) {
          // Ignore cleanup errors
        }
      })
    );
  }
}
