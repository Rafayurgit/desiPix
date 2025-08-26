import React from "react";
import ComponentLoader from "./componentLoader";

export default function ImageOutput({ convertedUrl, loading }) {
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
          <div className="grid grid-cols-2 gap-4">
            {convertedUrl.map((file, idx) => (
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
              <div key={file.name} className="border p-2 bg-white rounded">
                <img
                  src={file.url}
                  alt="Converted"
                  className="w-full h-64 object-contain border rounded bg-white mb-2"
                />
                <p>{file?.name}</p>
                <div className="flex justify-center m-3">
                  <a
                    href={file.url}
                    download={file.name}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow-md"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
