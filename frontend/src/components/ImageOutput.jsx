import React from 'react';

export default function ImageOutput() {


  return (
    <div className="w-full md:w-1/2 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Converted Image</h2>
      <img
        alt="Converted"
        className="w-full rounded mb-4"
      />
      <a
        download="converted-image"
        className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Download
      </a>
    </div>
  );
}
