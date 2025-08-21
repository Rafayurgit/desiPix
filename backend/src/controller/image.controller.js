import fs from "fs";
import crypto from "crypto";
import path from "path";
import { universalConvert } from "../services/universalConvert.service.js";
import mime from "mime-types";
import { safeUnlink } from "../utils/fileUtils.js";  // <-- import utility

const processedImages = new Set(); // Persist across requests

const getFileHash = (filepath) => {
  const fileBuffer = fs.readFileSync(filepath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};

export const convertImageController = async (req, res) => {
  const file = req.file;
  const { Format } = req.body;

  console.log("Uploaded file info:", file);
  console.log("Requested target format:", Format);

  if (!file || !Format) {
    return res.status(400).json({ message: "File and format are required" });
  }

  const originalExt = file.originalname.split(".").pop().toLowerCase();
  const normOriginalExt = originalExt === "jpg" ? "jpeg" : originalExt;
  const normFormat =
    Format.toLowerCase() === "jpg" ? "jpeg" : Format.toLowerCase();

  if (normOriginalExt === normFormat) {
    safeUnlink(file.path, "uploaded file");
    return res.status(400).json({
      message:
        "Source and target format are the same. Choose a different format.",
    });
  }

  try {
    const fileHash = getFileHash(file.path);
    const uniqueKey = `${fileHash}_${normFormat}`;

    if (processedImages.has(uniqueKey)) {
      safeUnlink(file.path, "uploaded file");
      return res
        .status(409)
        .json({ message: "Image already converted to this format." });
    }

    const outputPath = await universalConvert(file.path, normFormat);
    const absoluteOutputPath = path.resolve(outputPath);

    if (!fs.existsSync(absoluteOutputPath)) {
      return res
        .status(500)
        .json({ message: "Conversion failed: output file not found." });
    }

    processedImages.add(uniqueKey);

    const stat = fs.statSync(absoluteOutputPath);
    console.log("About to send file:", absoluteOutputPath, "size:", stat.size);

    const stream = fs.createReadStream(absoluteOutputPath);

    stream.on("error", (err) => {
      console.error("Streaming error:", err);
      if (!res.headersSent) res.status(500).send("Error streaming file");
    });

    req.on("close", () => {
      console.log("Client aborted request");
      stream.destroy();
    });

    const mimeType = mime.lookup(normFormat) || "application/octet-stream";

    const convertedStat = fs.statSync(absoluteOutputPath);
    const convertedFileInfo = {
      originalname: `converted.${normFormat}`,
      path: absoluteOutputPath,
      size: convertedStat.size,
      mimetype: mimeType,
      encoding: "N/A",
      destination: path.dirname(absoluteOutputPath),
      filename: path.basename(absoluteOutputPath),
    };

    console.log("Converted file info:", convertedFileInfo);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=converted.${normFormat}`
    );
    res.setHeader("Content-Type", mimeType);

    res.on("finish", () => {
      safeUnlink(file.path, "uploaded file");
      safeUnlink(absoluteOutputPath, "converted file");
      processedImages.delete(uniqueKey);
      console.log(`🧹 Cleanup after finished request for ${uniqueKey}`);
    });

    res.on("close", () => {
      safeUnlink(file.path, "uploaded file");
      safeUnlink(absoluteOutputPath, "converted file");
      processedImages.delete(uniqueKey);
      console.log(`🧹 Cleanup after aborted request for ${uniqueKey}`);
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Conversion failed error details:", error);
    safeUnlink(file?.path, "uploaded file");
    res
      .status(500)
      .json({ message: "Failed to convert image", error: error.message });
  }
};
