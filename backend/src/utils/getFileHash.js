// utils/getFileHash.js
import fs from "fs";
import crypto from "crypto";

export const getFileHash = (filepath) => {
  const fileBuffer = fs.readFileSync(filepath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};
