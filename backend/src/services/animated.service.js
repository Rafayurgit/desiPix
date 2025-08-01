// You can enhance detection with metadata or file signature checks

const animatedFormats = new Set(["gif", "webp", "apng"]);

export function isAnimatedFormat(format) {
  return animatedFormats.has(format);
}

export async function convertAnimatedFormat(inputPath, outputFormat) {
  // Use gifsicle, ffmpeg, or imagemagick CLI to convert animated images
  // Placeholder example:
  throw new Error("Animated format conversion not implemented yet");
}
