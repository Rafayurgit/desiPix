import React, { useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import heicPreview from "../assets/heicPreview.png";
import tiffPreview from "../assets/tiffPreview.png"
import { uploadAndConvert } from "../services/apiService";
import {
  getExtension,
  isAcceptedFormat,
  generateSignature,
} from "../utils/imageHelpers";
// Helper functions

const formatOptions = [
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "tiff",
  "heic",
  "avif",
  "svg",
  "ico",
];

export default function ImageInput({
  setConvertedUrl,
  setLoading,
  loading,
  setProgress,
}) {
  const [selectedFile, setSelectedFile] = useState([]);
  const [targetFormat, setTargetFormat] = useState("");
  const [previewUrl, setPreviewUrl] = useState([]);
  const [feedback, setFeedback] = useState({ warn: "", error: "" });
  const [lastConversion, setLastConversion] = useState({
    signature: "",
    format: "",
  });

  // All file-selection logic in one callback
  const onFileSelected = useCallback((file) => {
    const ext = getExtension(file.name);

    if (!isAcceptedFormat(ext)) {
      setFeedback({
        warn: "Unsupported file format, select correct format",
        error: "",
      });
      setSelectedFile(null);
      setPreviewUrl("");
      return;
    }
    if (ext === "heic" || ext === "heif") {
      setPreviewUrl(heicPreview);
    } else if (ext === "tiff" || ext === "tif"){
      setPreviewUrl(tiffPreview);
    } else {
      setPreviewUrl(URL.createObjectURL(file));
    }

    setSelectedFile(file);
    setFeedback({ warn: "", error: "" });
  }, []);

  // For dropzone and manual input—NO duplicate logic!
  const handleDrop = useCallback(
    (acceptedFiles) => {
      const validFiles=[];
      const preViews=[];

      acceptedFiles.forEach((file)=>{
        const ext=getExtension(file.name);
        
        if(isAcceptedFormat(ext)){
          validFiles.push(file);

          if (ext === "heic" || ext === "heif") {
      preViews.push(heicPreview);
    } else if (ext === "tiff" || ext === "tif") {
      preViews.push(tiffPreview);
    } else {
      preViews.push(URL.createObjectURL(file));
    }
        }
        
      })

      // if (acceptedFiles[0]) onFileSelected(acceptedFiles[0]);

      setSelectedFile(validFiles);
      setPreviewUrl(preViews);
      setFeedback({warn:"", error:""})
    },
    [onFileSelected]
  );

  const handleInputChange = (e) => {
    handleDrop([...e.target.files]);
    // if (e.target.files[0]) onFileSelected(e.target.files[0]);
  };

  // Dropzone config
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    onDrop: handleDrop,
  });

  // Reset everything
  const handleReset = () => {
    setSelectedFile([]);
    setPreviewUrl([]);
    setTargetFormat("");
    setFeedback({ warn: "", error: "" });
    setConvertedUrl("");
    setLastConversion({ signature: "", format: "" });
  };

  const handleRemoveFile = (index)=>{
    const updatedFiles    = selectedFile.filter((_, i)=> i !== index);
    const updatedPreviews = previewUrl.filter((_, i)=> i !== index); 

    setSelectedFile(updatedFiles);
    setPreviewUrl(updatedPreviews);
  }

  // Choose format
  const handleFormatChange = (e) => setTargetFormat(e.target.value);

  // Main convert action
  const handleConvert = async () => {
    setFeedback({ warn: "", error: "" });
    setLoading(true);

    if (!selectedFile.length || !targetFormat) {
      setFeedback({ warn: "Select the format first", error: "" });
      setLoading(false);
      return;
    }

    
    for(const file of selectedFile){
      const ext = getExtension(file.name);

      if (
    ext === targetFormat.toLowerCase() ||
    (ext === "jpg" && targetFormat === "jpeg") ||
    (ext === "jpeg" && targetFormat === "jpg")
  ) {
    setFeedback({
      warn: `You are trying to convert "${file.name}" to the same format`,
      error: "",
    });
    setLoading(false);
    return;
  }

  if (
      ext === targetFormat.toLowerCase() ||
      (ext === "jpg" && targetFormat === "jpeg") ||
      (ext === "jpeg" && targetFormat === "jpg")
    ) {
      setFeedback({
        warn: "You are trying to convert the file to the same format",
        error: "",
      });
      setLoading(false);

      return;
    }

    }

    

    const currSig = generateSignature(selectedFile);
    if (
      lastConversion.signature === currSig &&
      lastConversion.format === targetFormat
    ) {
      setFeedback({
        warn: "This file has already been converted to this format.",
        error: "",
      });
      setLoading(false);

      return;
    }

    setConvertedUrl("");
    setLoading(true);

    // try {

    //   const response = await axios.post(
    //     "http://localhost:8080/upload",
    //     formData,
    //     {
    //       responseType: "blob",
    //       timeout: 120000,
    //       onUploadProgress: (event) => {
    //         if (event.total) {
    //           const percent = Math.round((event.loaded * 100) / event.total);
    //           setProgress(Math.min(percent, 90));
    //         }
    //       },
    //     }
    //   );
    //   const blob = new Blob([response.data], {
    //     type: response.headers["content-type"],
    //   });
    //   console.log(blob);
    //   setProgress(95);

    //   const outputName =
    //     response.headers["x-converted-filename"] ||
    //     selectedFile.name.replace(/\.[^.]+$/, "." + targetFormat);
    //   setConvertedUrl({ url: URL.createObjectURL(blob), name: outputName });
    //   setLastConversion({ signature: currSig, format: targetFormat });
    // } catch (e) {
    //   if (axios.isAxiosError(e) && e.response?.status === 409) {
    //     setFeedback({
    //       warn: "This image has already been converted to this format earlier. Reset or choose another format.",
    //       error: "",
    //     });
    //   } else {
    //     setFeedback({ warn: "", error: "Failed to convert image" });
    //   }
    // }

    // try {
    //   const { blob, filename } = await uploadAndConvert(
    //     selectedFile,
    //     targetFormat,
    //     (p) => setProgress(Math.min(p, 70))
    //   );

    //   setConvertedUrl({ url: URL.createObjectURL(blob), name: filename });
    //   setLastConversion({
    //     signature: generateSignature(selectedFile),
    //     format: targetFormat,
    //   });
    // } 
    // try{
    //   const result = await Promise.all(
    //     selectedFile.map((file)=>
    //     uploadAndConvert(file, targetFormat, (p)=> setProgress(Math.min(p,70)))
    //     )
    //   )

    //   setConvertedUrl(
    //     result.map(({blob, filename})=>({
    //       url: URL.createObjectURL(blob),
    //       name: filename,
    //     }))
    //   )
    // }

    try{
      const data = await uploadAndConvert(selectedFile, targetFormat, (p)=> setProgress(Math.min(p,70)));
      // if(data.success){
      //   setConvertedUrl(data.files);
      // }
      if (data.success) {
    const backendUrl = "http://localhost:8080"; // 👈 your backend URL
    setConvertedUrl(
      data.files.map((f) => ({
        ...f,
        url: `${backendUrl}${f.url}`, // 👈 prefix with backend
      }))
    );
  }
    }
    catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        setFeedback({
          warn: "This image has already been converted to this format earlier. Reset or choose another format.",
          error: "",
        });
      } else {
        setFeedback({ warn: "", error: "Failed to convert image" });
      }
    }

    setLoading(false);
    setProgress(100);

    setTimeout(() => {
      setProgress(0);
    }, 1000);
  };

  // Memoize options for performance
  const formatDropdown = useMemo(
    () => (
      <select
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 cursor-pointer transition"
        value={targetFormat}
        onChange={handleFormatChange}
      >
        <option value="" disabled hidden>
          Select Format
        </option>
        {formatOptions.map((fmt) => (
          <option key={fmt} value={fmt}>
            {fmt.toUpperCase()}
          </option>
        ))}
      </select>
    ),
    [targetFormat]
  );

  return (
    <div
      id="imageInput"
      className="w-full md:w-1/2 bg-gray-100 p-6 rounded-lg shadow-lg"
    >
      <h1 className="text-xl font-semibold mb-4">Upload Image</h1>

      {previewUrl.length > 0  ? (
        <>
        <div className={`max-h-96 overflow-y-auto gap-4 mb-4 ${previewUrl.length > 4 ? "grid grid-cols-3" : "grid grid-cols-2"}`}>
          {previewUrl.map((url,idx)=>(
            <div key={idx} className="border p-2 bg-white rounded">
              <div className="relative border p-2 bg-white rounded">
                <button onClick={()=>handleRemoveFile(idx)}
                className="absolute top-1 right-1 bg-indigo-900 text-white rounded-full p-1 text-xs hover:bg-red-600 cursor-pointer"
        title="Remove image"
                >
                  ✕
                </button>
              </div>
              <img
            src={url}
            alt={selectedFile[idx]?.name || "preview"}
            className="w-full h-64 object-contain border rounded bg-white mb-2"
          />
          <p className="text-sm truncate">{selectedFile[idx]?.name}</p>
          {url.error && (
                  <p className="text-red-500">Error: {url.error}</p>
                )}
            </div>
            
          ))}
        </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 p-5 justify-between items-stretch w-full">
            <div className="w-full sm:flex-1 min-w-[150px]">
              {formatDropdown}
            </div>

            <button
              className={`transition duration-200 text-white px-6 py-2 rounded shadow-md 
    ${
      !selectedFile || !targetFormat || loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-indigo-900 hover:bg-indigo-700 cursor-pointer"
    }`}
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
              name="images"
              multiple
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
