import React from "react";

export default function ImageOutput({ convertedUrl }) {

  
  return (
    <div className="w-full md:w-1/2 bg-gray-100 p-6 rounded-lg shadow-lg ">
      <h2 className="text-xl font-semibold mb-4">Converted Image</h2>

      {!convertedUrl ? (
        <p className="text-gray-500">
          Your converted image will appear here after processing.
        </p>
      ) : (
        <>
          <img
            src={convertedUrl}
            alt="Converted"
            className="w-full h-64 object-contain border rounded bg-white mb-2"
          />
          {/* {convertedUrl?.name} */}

          <a
            href={convertedUrl}
            download="converted-image"
            className="bg-green-600 hover:bg-green-700 transition duration-200 text-white px-6 py-2 rounded shadow-md cursor-pointer"
          >
            Download
          </a>
        </>
      )}
    </div>
  );
}
