import React from "react";

export default function ImageOutput({ convertedUrl }) {
  return (
    <div className="w-full md:w-1/2 bg-gray-100 p-6 rounded shadow">
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
            className="w-full rounded mb-4"
          />
          <a
            href={convertedUrl}
            download="converted-image"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
          >
            Download
          </a>
        </>
      )}
    </div>
  );
}
