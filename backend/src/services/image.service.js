// services/image.service.js
import fs from "fs";
import crypto from "crypto";
import path from "path";
import mime from "mime-types";
import { safeUnlink } from "../utils/fileUtils.js";
import { universalConvert } from "../services/universalConvert.service.js";


const CACHE_LIFETIME_MS = 60 * 60 * 1000;
const processedImages = new Map();


// function cleanupCache() {
//   const now = Date.now();
//   for (const [uniqueKey, { outputPath, expiresAt }] of processedImages.entries()) {
//     if (expiresAt < now) {
//       safeUnlink(outputPath, "converted file (cache expired)");
//       processedImages.delete(uniqueKey);
//     }
//   }
// }

// const getFileHash = (filepath) => {
//   const fileBuffer = fs.readFileSync(filepath);
//   return crypto.createHash("sha256").update(fileBuffer).digest("hex");
// };




// export const imageService = {
//   async convert(file, format) {
//     const originalExt = file.originalname.split(".").pop().toLowerCase();
//     const normOriginalExt = originalExt === "jpg" ? "jpeg" : originalExt;
//     const normFormat =
//       format.toLowerCase() === "jpg" ? "jpeg" : format.toLowerCase();

//     if (normOriginalExt === normFormat) {
//       safeUnlink(file.path, "uploaded file");
//       throw new Error(
//         "Source and target format are the same. Choose a different format."
//       );
//     }

//     const fileHash = getFileHash(file.path);
//     const uniqueKey = `${fileHash}_${normFormat}`;

//     cleanupCache();

//     const cachedEntry = processedImages.get(uniqueKey);

//     if (
//   cachedEntry &&
//   cachedEntry.expiresAt > Date.now() &&
//   fs.existsSync(cachedEntry.outputPath)
// ) {
//   safeUnlink(file.path, "uploaded file");
//   // Return info for already converted, cached file
//   return {
//     filePath: null,
//     outputPath: cachedEntry.outputPath,
//     uniqueKey,
//     url: `/uploads/${path.basename(cachedEntry.outputPath)}`,
//     fromCache: true,
//   };
//   }
    

//     // if (processedImages.has(uniqueKey)) {
//     //   safeUnlink(file.path, "uploaded file");
//     //   throw new Error("Image already converted to this format.");
//     // }

//     // if (processedImages.has(uniqueKey)) {
//     //   // Check if file still exists!
//     //   if (fs.existsSync(absoluteOutputPath)) {
//     //     // File is there, return download info
//     //     return {
//     //       stream,
//     //       mimeType,
//     //       uniqueKey,
//     //       filePath,
//     //       outputPath: absoluteOutputPath,
//     //     };
//     //   } else {
//     //     // File was cleaned, allow re-conversion
//     //     processedImages.delete(uniqueKey);
//     //     // Proceed to convert as normal...
//     //   }
//     // }
//     // ...convert as normal if not cached


// // Cleanup any expired cache entries before checking










//     const outputPath = await universalConvert(file.path, normFormat);
//     const absoluteOutputPath = path.resolve(outputPath);

//     processedImages.set(uniqueKey, {
//   outputPath: absoluteOutputPath,
//   expiresAt: Date.now() + CACHE_LIFETIME_MS,
// });

//     if (!fs.existsSync(absoluteOutputPath)) {
//       throw new Error("Conversion failed: output file not found.");
//     }

//     // processedImages.add(uniqueKey);
//     processedImages.set(uniqueKey, {
//       outputPath: absoluteOutputPath,
//       expiresAt: Date.now() + CACHE_LIFETIME_MS,
//     });

//     safeUnlink(file.path, "uploaded file");

//     const mimeType = mime.lookup(normFormat) || "application/octet-stream";
//     const stream = fs.createReadStream(absoluteOutputPath);

//     return {
//   stream,
//   mimeType,
//   uniqueKey,
//   filePath: null,
//   outputPath: absoluteOutputPath,
//   url: `/uploads/${path.basename(absoluteOutputPath)}`,
//   fromCache: false,
// };

//     // return {
//     //   stream,
//     //   mimeType,
//     //   uniqueKey,
//     //   filePath: file.path,
//     //   outputPath: absoluteOutputPath,
//     // };
//   },

//   cleanup(filePath, outputPath, uniqueKey, reason) {
//     safeUnlink(filePath, "uploaded file");
//     safeUnlink(outputPath, "converted file");
//     processedImages.delete(uniqueKey);
//     console.log(`🧹 Cleanup after ${reason} request for ${uniqueKey}`);
//   },
// };



// Cleanup expired cache files and remove entries from Map
function cleanupCache() {
  const now = Date.now();
  for (const [uniqueKey, { outputPath, expiresAt }] of processedImages.entries()) {
    if (expiresAt < now) {
      safeUnlink(outputPath, "converted file (cache expired)");
      processedImages.delete(uniqueKey);
      console.log(`🧹 Cache expired, cleaned: ${outputPath}`);
    }
  }
}

// Hash file content to generate unique key per image
const getFileHash = (filepath) => {
  const fileBuffer = fs.readFileSync(filepath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};

export const imageService = {
  async convert(file, format) {
    const originalExt = file.originalname.split(".").pop().toLowerCase();
    const normOriginalExt = originalExt === "jpg" ? "jpeg" : originalExt;
    const normFormat = format.toLowerCase() === "jpg" ? "jpeg" : format.toLowerCase();

    // Reject conversion if source and target are the same fmt
    if (normOriginalExt === normFormat) {
      safeUnlink(file.path, "uploaded file");
      throw new Error("Source and target format are the same. Choose a different format.");
    }

    // Generate hash key for cache lookup
    const fileHash = getFileHash(file.path);
    const uniqueKey = `${fileHash}_${normFormat}`;

    // Cleanup expired files before processing
    cleanupCache();

    // Check if cached converted file exists and is valid
    const cachedEntry = processedImages.get(uniqueKey);
    if (cachedEntry && cachedEntry.expiresAt > Date.now() && fs.existsSync(cachedEntry.outputPath)) {
      safeUnlink(file.path, "uploaded file"); // Cleanup uploaded original
      return {
        stream: fs.createReadStream(cachedEntry.outputPath),
        mimeType: mime.lookup(normFormat) || "application/octet-stream",
        uniqueKey,
        filePath: null,
        outputPath: cachedEntry.outputPath,
        url: `/uploads/${path.basename(cachedEntry.outputPath)}`,
        fromCache: true,
      };
    }

    // Not cached or cache expired, so perform actual conversion
    const outputPath = await universalConvert(file.path, normFormat);
    const absoluteOutputPath = path.resolve(outputPath);

    if (!fs.existsSync(absoluteOutputPath)) {
      throw new Error("Conversion failed: output file not found.");
    }

    // Update cache with new converted file info and expiry
    processedImages.set(uniqueKey, {
      outputPath: absoluteOutputPath,
      expiresAt: Date.now() + CACHE_LIFETIME_MS,
    });

    // Cleanup uploaded source file after conversion
    safeUnlink(file.path, "uploaded file");

    return {
      stream: fs.createReadStream(absoluteOutputPath),
      mimeType: mime.lookup(normFormat) || "application/octet-stream",
      uniqueKey,
      filePath: null,
      outputPath: absoluteOutputPath,
      url: `/uploads/${path.basename(absoluteOutputPath)}`,
      fromCache: false,
    };
  },

  // Manual cleanup method, useful for explicit deletes (e.g., aborted requests)
  cleanup(filePath, outputPath, uniqueKey, reason) {
    safeUnlink(filePath, "uploaded file");
    safeUnlink(outputPath, "converted file");
    processedImages.delete(uniqueKey);
    console.log(`🧹 Cleanup after ${reason} request for ${uniqueKey}`);
  },
};
