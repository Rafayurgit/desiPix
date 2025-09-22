import React from "react";
import ComponentLoader from "./componentLoader";
import heicPreview from "../assets/heicPreview.png";
import tiffPreview from "../assets/tiffPreview.png";

export default function ImageOutput({ convertedUrl, loading }) {
  const handleDownload = async (url, filename) => {
    if (!url || url === "null") {
      alert("Invalid download URL");
      return;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (error) {
      alert("Failed to download file");
      console.error(error);
    }
  };

  const getPreview = (file) => {
    const ext = file.name?.split(".").pop().toLowerCase();
    // if (ext === "heic" || ext === "heif") return  heicPreview;
    if (ext === "tiff" || ext === "tif") return tiffPreview;
    return file.url; // fallback: actual image
  };

  return (
    <div className="w-full md:w-1/2 bg-gray-100 p-6 rounded-lg shadow-lg ">
      <h2 className="text-xl font-semibold mb-4">Converted Image</h2>

      {!convertedUrl.length ? (
        <div className="text-gray-500">
          Your converted image will appear here after processing.
          <div className="flex justify-center items-center">
            {loading && <ComponentLoader />}
          </div>
        </div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto flex flex-col gap-3">
          {convertedUrl
            .filter((file) => file.url && file.url !== "null")
            .map((file, idx) => (
              <div
                key={file.url || file.name || idx}
                className="flex items-center gap-3 border p-2 bg-white rounded shadow-sm"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={getPreview(file)}
                    alt={file.name || "Converted"}
                    className="w-20 h-20 object-cover border rounded bg-white"
                    loading="lazy"
                  />
                </div>

                {/* File info + download */}
                <div className="flex flex-col justify-between flex-1 overflow-hidden">
                  <p
                    className="text-sm font-medium truncate max-w-[200px]"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 uppercase">
                    {file.name?.split(".").pop()}
                  </p>
                </div>

                {/* Download button */}
                <div className="flex-shrink-0">
<button
  onClick={() => handleDownload(file.url, file.name)}
  aria-label={`Download ${file.name}`}
  className="bg-green-600 hover:bg-green-700 text-white rounded 
             px-1 py-1 sm:px-4 sm:py-2 
             text-sm ml-2 flex items-center justify-center"
>
  {/* Mobile: icon only */}
  <span className="block sm:hidden">⬇</span>

  {/* Desktop: text */}
  <span className="hidden sm:inline">Download</span>
</button>


                </div>
              </div>
            ))}
        </div>
        </>
      )}
    </div>
  );
}
