import { exec } from "child_process";
import util from "util";
import path from "path";
import { log } from "console";


const execAsync = util.promisify(exec);

// export function canUseImageMagick(inputFormat, outputFormat) {
//   const supported = new Set([
//     "tiff", "tif", "gif", "bmp", "ico", "svg", "pdf", "webp",
//     "jpeg", "jpg", "heic" // etc.
//   ]);
//   return supported.has(inputFormat) || supported.has(outputFormat);
// }

// export async function convertWithImageMagick(inputPath, outputFormat) {
//   const normalizedInputPath = path.resolve(inputPath);
//   const outputPath = normalizedInputPath + "." + outputFormat;
//   const normalizedOutputPath = path.resolve(outputPath);

//   let command;
//   if (outputFormat === 'ico') {
//     command = `magick "${normalizedInputPath}" -resize 256x256 -define icon:auto-resize=256,128,64,48,32,16 "${normalizedOutputPath}"`;
//   } else {
//     command = `magick "${normalizedInputPath}" -quality 85 "${normalizedOutputPath}"`;
//   }

//   try {
//     const { stdout, stderr } = await execAsync(command);
//     if (stderr) console.log("ImageMagick stderr:", stderr);
//     return normalizedOutputPath;
//   } catch (error) {
//     console.log("ImageMagick command failed:", error);
//     throw error;
//   }
// }


export function canUseImageMagick(inputFormat, outputFormat) {
  const supported = new Set([
    "tiff", "tif", "gif", "bmp", "ico", "svg", "pdf", "webp",
    "jpeg", "jpg", "heic", "heif", "avif", "png", "psd", "xcf"
  ]);
  return supported.has(inputFormat) || supported.has(outputFormat);
}

export async function convertWithImageMagick(inputPath, outputFormat) {
  const normalizedInputPath = path.resolve(inputPath);
  const outputPath = normalizedInputPath + "." + outputFormat;
  const normalizedOutputPath = path.resolve(outputPath);

  let command;
  
  // Format-specific ImageMagick commands
  switch (outputFormat.toLowerCase()) {
    case 'ico':
      command = `magick "${normalizedInputPath}" -resize 256x256 -define icon:auto-resize=256,128,64,48,32,16 "${normalizedOutputPath}"`;
      break;
      
    case 'svg':
      // ImageMagick can't create true SVGs from rasters, but can embed raster in SVG
      command = `magick "${normalizedInputPath}" -density 300 -background transparent "${normalizedOutputPath}"`;
      break;
      
    case 'avif':
      command = `magick "${normalizedInputPath}" -quality 80 -define heic:speed=4 "${normalizedOutputPath}"`;
      break;
      
    case 'heic':
    case 'heif':
      command = `magick "${normalizedInputPath}" -quality 85 -define heic:speed=4 "${normalizedOutputPath}"`;
      break;
      
    case 'webp':
      command = `magick "${normalizedInputPath}" -quality 90 -define webp:method=6 "${normalizedOutputPath}"`;
      break;
      
    case 'pdf':
      command = `magick "${normalizedInputPath}" -density 300 -quality 90 "${normalizedOutputPath}"`;
      break;
      
    case 'tiff':
    case 'tif':
      command = `magick "${normalizedInputPath}" -compress lzw -quality 90 "${normalizedOutputPath}"`;
      break;
      
    case 'bmp':
      command = `magick "${normalizedInputPath}" -type TrueColor "${normalizedOutputPath}"`;
      break;
      
    default:
      command = `magick "${normalizedInputPath}" -quality 85 "${normalizedOutputPath}"`;
  }

  try {
    console.log(`Executing ImageMagick command: ${command}`);
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    if (stderr && !stderr.includes('deprecated')) {
      console.log("ImageMagick stderr:", stderr);
    }
    
    if (stdout) {
      console.log("ImageMagick stdout:", stdout);
    }
    
    // Verify output file was created
    const fs = await import('fs/promises');
    try {
      const stats = await fs.stat(normalizedOutputPath);
      if (stats.size === 0) {
        throw new Error("ImageMagick created empty output file");
      }
      console.log(`ImageMagick conversion successful. Output file size: ${stats.size} bytes`);
    } catch (statError) {
      throw new Error(`ImageMagick output file verification failed: ${statError.message}`);
    }
    
    return normalizedOutputPath;
  } catch (error) {
    console.error("ImageMagick command failed:", error);
    
    // Try a simpler fallback command
    const fallbackCommand = `magick "${normalizedInputPath}" "${normalizedOutputPath}"`;
    try {
      console.log(`Trying fallback command: ${fallbackCommand}`);
      const { stdout, stderr } = await execAsync(fallbackCommand, { timeout: 30000 });
      
      if (stderr && !stderr.includes('deprecated')) {
        console.log("ImageMagick fallback stderr:", stderr);
      }
      
      return normalizedOutputPath;
    } catch (fallbackError) {
      console.error("ImageMagick fallback also failed:", fallbackError);
      throw new Error(`ImageMagick conversion failed: ${error.message}. Fallback also failed: ${fallbackError.message}`);
    }
  }
}