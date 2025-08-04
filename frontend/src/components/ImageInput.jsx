import React, { useState, useMemo, useCallback } from "react";
import axios from "axios";
import ComponentLoader from "./componentLoader";
import { useDropzone } from "react-dropzone";
import heicPreview from "../assets/heicPreview.png"

// Helper functions
const getExtension = filename =>
  filename ? filename.split(".").pop().toLowerCase() : "";

const isAcceptedFormat = ext =>
  [
    "jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff",
    "heic", "avif", "svg", "ico"
  ].includes(ext);

const generateSignature = file =>
  file ? `${file.name}_${file.size}_${file.lastModified};` : "";

const formatOptions = [
  "jpeg", "png", "webp", "gif", "bmp", "tiff", "heic", "avif", "svg", "ico"
];

export default function ImageInput({ setConvertedUrl , setLoading, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [feedback, setFeedback] = useState({ warn: "", error: "" });
  const [lastConversion, setLastConversion] = useState({ signature: "", format: "" });

  // All file-selection logic in one callback
  const onFileSelected = useCallback(file => {
    const ext = getExtension(file.name);
    if (!isAcceptedFormat(ext)) {
      setFeedback({ warn: "Unsupported file format, select correct format", error: "" });
      setSelectedFile(null);
      setPreviewUrl("");
      return;
    }
    if(ext === "heic" || ext=== "heif" ){
      setPreviewUrl(heicPreview)
    }else{
      setPreviewUrl(URL.createObjectURL(file));
    }
    
    setSelectedFile(file);
    setFeedback({ warn: "", error: "" });
  }, []);

  // For dropzone and manual input—NO duplicate logic!
  const handleDrop = useCallback(acceptedFiles => {
    if (acceptedFiles[0]) onFileSelected(acceptedFiles[0]);
  }, [onFileSelected]);

  const handleInputChange = e => {
    if (e.target.files[0]) onFileSelected(e.target.files[0]);
  };

  // Dropzone config
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: handleDrop
  });

  // Reset everything
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setTargetFormat("");
    setFeedback({ warn: "", error: "" });
    setConvertedUrl("");
    setLastConversion({ signature: "", format: "" });
  };

  // Choose format
  const handleFormatChange = e => setTargetFormat(e.target.value);

  // Main convert action
  const handleConvert = async () => {
    setFeedback({ warn: "", error: "" });

    if (!selectedFile || !targetFormat) {
      setFeedback({ warn: "Select the format first", error: "" });
      return;
    }

    const ext = getExtension(selectedFile.name);
    if (
      ext === targetFormat.toLowerCase() ||
      (ext === "jpg" && targetFormat === "jpeg") ||
      (ext === "jpeg" && targetFormat === "jpg")
    ) {
      setFeedback({ warn: "You are trying to convert the file to the same format", error: "" });
      return;
    }

    const currSig = generateSignature(selectedFile);
    if (
      lastConversion.signature === currSig &&
      lastConversion.format === targetFormat
    ) {
      setFeedback({ warn: "This file has already been converted to this format.", error: "" });
      return;
    }

    const formData = new FormData();
    formData.append("Image", selectedFile);
    formData.append("Format", targetFormat);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/upload",
        formData,
        { responseType: "blob", timeout: 120000 }
      );
      const blob = new Blob([response.data], {
        type: response.headers["content-type"]
      });
      setConvertedUrl(URL.createObjectURL(blob));
      setLastConversion({ signature: currSig, format: targetFormat });
    } catch (e) {
      setFeedback({ warn: "", error: "Failed to convert image" });
    }
    setLoading(false);
  };

  // Memoize options for performance
  const formatDropdown = useMemo(() => (
    <select
      className="cursor-pointer"
      value={targetFormat}
      onChange={handleFormatChange}
    >
      <option value="" disabled hidden>Select Format</option>
      {formatOptions.map(fmt => (
        <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
      ))}
    </select>
  ), [targetFormat]);

  return (
    <div
      id="imageInput"
      className="w-full md:w-1/2 bg-gray-100 p-6 rounded-lg shadow-lg"
    >
      <h1 className="text-xl font-semibold mb-4">Upload Image</h1>

      {previewUrl ? (
        <>
          <img src={previewUrl}
            alt={selectedFile?.name || "preview"}
            className="w-full h-64 object-contain border rounded bg-white mb-2"/>
          {selectedFile?.name}
          <div className="flex flex-row p-5 justify-between m-3">
            {formatDropdown}
            <button
              className={`transition duration-200 text-white px-6 py-2 rounded shadow-md 
    ${!selectedFile || !targetFormat || loading 
      ? "bg-gray-400 cursor-not-allowed" 
      : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"}`}
              onClick={handleConvert}
              disabled={!selectedFile || !targetFormat || loading}
            >
              Convert
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-md cursor-pointer"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </>
      ) : (
        <div
          {...getRootProps()}
          className={`w-full p-6 border-2 border-dashed rounded-lg bg-white hover:bg-gray-100 cursor-pointer text-center transition-colors duration-300 border-indigo-400`}
        >
          <label htmlFor="image" className="block cursor-pointer">
            <input
              {...getInputProps()}
              type="file"
              name="image"
              onChange={handleInputChange}
              accept="image/*, .heic"
              className="hidden"
            />
            <span>Drag or click to select your image</span>
          </label>
        </div>
      )}

      {feedback.warn && <p className="text-red-600">{feedback.warn}</p>}
      {feedback.error && <p className="text-red-600">{feedback.error}</p>}
      
    </div>
  );
}
