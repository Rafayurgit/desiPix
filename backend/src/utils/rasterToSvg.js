import potrace from "potrace";
import fs from "fs/promises";

export async function rasterToSvg(inputPath) {
  const outputPath = inputPath + ".svg";
  return new Promise((resolve, reject) => {
    potrace.trace(inputPath, {
      // You can customize params, e.g. threshold, color, background, etc.
      threshold: 128,
      color: 'black',
      background: 'white',
    }, async (err, svg) => {
      if (err) return reject(err);
      await fs.writeFile(outputPath, svg);
      resolve(outputPath);
    });
  });
}
