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
          <div className={`max-h-96 overflow-y-auto gap-4 mb-4 ${convertedUrl.length>4 ?"grid grid-cols-3":"grid grid-cols-1"}`}>
            {/* {convertedUrl.map((file, idx) => (
              // <>
              //   <div key={file.name} className="border p-2 bg-white rounded">
              //     <img
              //       src={file.url}
              //       alt="Converted"
              //       className="w-full h-64 object-contain border rounded bg-white mb-2"
              //     />

              //     <p className="">{file?.name}</p>
              //   </div>

              //   <div className="flex flex-row justify-center m-3 p-6">
              //     <a
              //       href={file?.url}
              //       download={file.name}
              //       className="bg-green-600 hover:bg-green-700 transition duration-200 text-white px-6 py-2 rounded shadow-md cursor-pointer"
              //     >
              //       Download
              //     </a>
              //   </div>
              // </>
              <div
                key={file.id || file.url}
                className="border p-2 bg-white rounded"
              >
                <img
                  src={file.url}
                  alt="Converted"
                  className="w-full h-64 object-contain border rounded bg-white mb-2"
                />
                <p>{file?.name}</p>
                {file.error && (
                  <p className="text-red-500">Error: {file.error}</p>
                )}
                <div className="flex justify-center m-3">
                  <a
                    href={file.url}
                    download={file.name || file.originalName}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow-md"
                  >
                    Download
                  </a>

                  <button
                    onClick={() => handleDownload(file.url, file.name)}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-6 py-2 rounded shadow-md"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))} */}

            {convertedUrl
              .filter((file) => file.url && file.url !== "null")
              .map((file, idx) => (
                <div
                  key={file.url || file.name || idx}
                  className="border p-2 bg-white rounded"
                >
                  <img
                    src={getPreview(file)}
                    alt={file.name || "Converted"}
                    className="w-full h-64 object-contain border rounded bg-white mb-2"
                  />
                  <p>{file.name}</p>
                  {file.error && (
                    <p className="text-red-500">Warning: {file.error}</p>
                  )}
                  <div className="flex justify-center m-3">
                    <button
                      onClick={() => handleDownload(file.url, file.name)}
                      className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-6 py-2 rounded shadow-md"
                    >
                      Download
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
