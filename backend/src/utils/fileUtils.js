import fs from "fs";

/**
 * Safely delete a file without throwing if it doesn't exist.
 * @param {string} filepath - Path of file to delete.
 * @param {string} [label] - Optional label for logging.
 */
export const safeUnlink = (filepath, label = "file") => {
  if (!filepath) return;

  fs.unlink(filepath, (err) => {
    if (err) {
      if (err.code !== "ENOENT") {
        console.error(`❌ Failed deleting ${label}:`, err);
      }
    } else {
      console.log(`✅ ${label} cleaned up: ${filepath}`);
    }
  });
};
