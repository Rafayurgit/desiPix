// services/image.service.js
import fs from "fs";
import crypto from "crypto";
import path from "path";
import mime from "mime-types";
import { safeUnlink } from "../utils/fileUtils.js";
import { universalConvert } from "../services/universalConvert.service.js";


const processedImages = new Set();

const getFileHash = (filepath) => {
  const fileBuffer = fs.readFileSync(filepath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};

export const imageService = {
  async convert(file, format) {
    const originalExt = file.originalname.split(".").pop().toLowerCase();
    const normOriginalExt = originalExt === "jpg" ? "jpeg" : originalExt;
    const normFormat = format.toLowerCase() === "jpg" ? "jpeg" : format.toLowerCase();

    if (normOriginalExt === normFormat) {
      safeUnlink(file.path, "uploaded file");
      throw new Error("Source and target format are the same. Choose a different format.");
    }

    const fileHash = getFileHash(file.path);
    const uniqueKey = `${fileHash}_${normFormat}`;

    if (processedImages.has(uniqueKey)) {
      safeUnlink(file.path, "uploaded file");
      throw new Error("Image already converted to this format.");
    }

    const outputPath = await universalConvert(file.path, normFormat);
    const absoluteOutputPath = path.resolve(outputPath);

    if (!fs.existsSync(absoluteOutputPath)) {
      throw new Error("Conversion failed: output file not found.");
    }

    processedImages.add(uniqueKey);

    const mimeType = mime.lookup(normFormat) || "application/octet-stream";
    const stream = fs.createReadStream(absoluteOutputPath);

    return {
      stream,
      mimeType,
      uniqueKey,
      filePath: file.path,
      outputPath: absoluteOutputPath,
    };
  },

  cleanup(filePath, outputPath, uniqueKey, reason) {
    safeUnlink(filePath, "uploaded file");
    safeUnlink(outputPath, "converted file");
    processedImages.delete(uniqueKey);
    console.log(`🧹 Cleanup after ${reason} request for ${uniqueKey}`);
  },
};
