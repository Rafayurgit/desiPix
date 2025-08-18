import fs from 'fs/promises';
import { parseICO } from 'icojs';  // fixed import
import sharp from 'sharp';
import path from 'path';

export async function robustIcoConvert(inputPath, outputFormat) {
  const buf = await fs.readFile(inputPath);

  const images = await parseICO(buf, 'image/png');  // correct function

  if (!images || !images.length) {
    throw new Error('ICO parsing failed – no images found.');
  }

  // Choose the largest image by pixel area
  const best = images.sort((a, b) => b.width * b.height - a.width * a.height)[0];

  const outputPath = inputPath + '.' + outputFormat;
  await sharp(Buffer.from(best.buffer))
    .toFormat(outputFormat)
    .toFile(outputPath);

  return outputPath;
}
