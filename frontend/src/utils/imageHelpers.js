

export const getExtension = (filename) =>
  filename ? filename.split(".").pop().toLowerCase() : "";

export const isAcceptedFormat = (ext) =>
  [
    "jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff",
    "heic", "avif", "svg", "ico"
  ].includes(ext);


export const generateSignature = (file) =>
  file ? `${file.name}_${file.size}_${file.lastModified};` : "";