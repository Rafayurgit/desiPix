import React, { useState } from "react";
import axios from "axios";
import ComponentLoader from "./componentLoader";

const acceptedFormats = [
  "jpg", // JPEG
  "jpeg", // JPEG (some systems differentiate)
  "png", // Portable Network Graphics
  "webp", // Web Picture Format (modern, efficient)
  "gif", // Graphics Interchange Format (animations)
  "bmp", // Bitmap (older Windows format)
  "tiff", // Tagged Image File Format (used in printing)
  "heic", // High-Efficiency Image Container (used by iPhones)
  "avif", // AV1 Image File Format (next-gen compression)
  "svg", // Scalable Vector Graphics (not pixel-based but still image)
];

export default function ImageInput({setConvertedUrl}) {
  const [selectedFile, SetSelectedFile] = useState(null);
  const [targetFormat, SetTargetFormat] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showWarning, setShowWarning] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // const [convertedUrl, setConvertedUrl] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    if (!acceptedFormats.includes(extension)) {
      setShowWarning("Unsupported file format, select correct format");
      return;
    }

    SetSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowWarning("");
  };

  const handleFormat = (e) => {
    SetTargetFormat(e.target.value);
  };

  const handleConvert = async () => {

    if (!selectedFile || !targetFormat) {
      setShowWarning("Select the format first");
      return;
    }

    const formData = new FormData();
    formData.append("Image", selectedFile);
    formData.append("Format", targetFormat);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8080/upload",
        formData,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const downloadUrl = URL.createObjectURL(blob);
      setConvertedUrl(downloadUrl);
      setLoading(false);
    } catch (error) {
      console.log("Conversion error", error);
      setError("Failed to convert image");
      setLoading(false);
    }

    setShowWarning("");
  };

  return (
    <div id="imageInput" className="flex flex-col items-center w-full md:w-1/2 bg-gray-100 p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Upload Image</h1>

      {previewUrl ? (
        <>
          <img src={previewUrl} 
          alt={selectedFile?.name || "preview"} 
          className="w-full h-64 object-contain border rounded bg-white mb-2" />

          {selectedFile?.name}

          <div className="flex flex-row p-5 justify-between m-3">
            <select
              className="cursor-pointer"
              value={targetFormat}
              onChange={handleFormat}
            >
              <option value="" disabled hidden>
                Select Format
              </option>
              {acceptedFormats.map((format, idx) => (
                <option key={idx} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              className="w-full bg-indigo-800 hover:bg-indigo-300 cursor-pointer text-white font-semibold py-2 px-4 rounded p-1"
              onClick={handleConvert}
              disabled={!selectedFile || !targetFormat}
            >
              Convert
            </button>


          </div>
        </>
      ) : (
        <>
          <label htmlFor="image" className="block cursor-pointer" >
            
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              className="block w-full justify-between text-sm text-gray-700 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700  "
            />
          </label>


          
        </>
      )}
      
      <p className="text-red-500">{showWarning} </p>

      {loading && <ComponentLoader /> }
    </div>
  );
}
