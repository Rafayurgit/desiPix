import React, { useState } from 'react'

const acceptedFormats=[
    "jpg",     // JPEG
    "jpeg",    // JPEG (some systems differentiate)
    "png",     // Portable Network Graphics
    "webp",    // Web Picture Format (modern, efficient)
    "gif",     // Graphics Interchange Format (animations)
    "bmp",     // Bitmap (older Windows format)
    "tiff",    // Tagged Image File Format (used in printing)
    "heic",    // High-Efficiency Image Container (used by iPhones)
    "avif",    // AV1 Image File Format (next-gen compression)
    "svg"      // Scalable Vector Graphics (not pixel-based but still image)
  ]

export default function ImageInput() {

  const [selectedFile,SetSelectedFile]= useState(null);
  const [targetFormat, SetTargetFormat]= useState("");
  const [previewUrl, setPreviewUrl]= useState("");
  const [showWarning, setShowWarning]= useState("");
  const [loading, setLoading]= useState(false);
  const [convertedUrl, setConvertedUrl]= useState("");

  const handelFileChange=(e)=>{
    const file= e.target.files[0];
    if(!file) return;

    SetSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handelFormat=(e)=>{
    SetTargetFormat(e.target.value);
  }

  const handleConvert = async()=>{
    if(!selectedFile || !targetFormat) {
      setShowWarning("Select the format first")
      return;
    }

    const formData = new formData();
    formData.append("Image", selectedFile);
    formData.append("Format", targetFormat);

    try {
      setLoading(true);
      const response =await axiox.post("http://localhost:5000/upload", formData,{
        responseType: "Blob"
      })

      const blob= new blob([response.data]);
      const downloadUrl = URL.createObjectURL(blob);
      setConvertedUrl(downloadUrl);
      setLoading(false);
    } catch (error) {
      console.log("Conversion error", error);
      setError("Failed to convert image")
      setLoading(false)
    }

    setShowWarning("");
      
  }


  return (

    <div className='flex flex-col items-center w-full md:w-1/2 bg-gray-100 p-6 rounded shadow'>
      
      <h1 className='text-xl font-semibold mb-4' >Upload Image</h1>

      {previewUrl ? (
        <>              
        <img src={previewUrl} alt='Preview' className=''/> 

        <div className='flex flex-row p-5 justify-between m-3'>
        <select 
        className='cursor-pointer'
          value={targetFormat}
          onChange={handelFormat}
          >
            <option value="" disabled hidden>Select Format</option>
            {acceptedFormats.map((format, idx)=>(
              <option key={idx} value={format}>{format.toUpperCase()}</option>
            ))}
        </select>

        <button 
        className='w-full bg-orange-500 hover:bg-orange-600 cursor-pointer text-white font-semibold py-2 px-4 rounded disabled:opacity-50 p-1'
        onClick={handleConvert}
        disabled={!selectedFile || !targetFormat}
        >Convert</button>
      </div>

        </>
      ) : (
        <>

        <label htmlFor="">
        <input type="file"
        name='image'
        onChange={handelFileChange}
        accept='image/*' 
        className=' block w-full justify-between text-sm  text-gray-700 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700  '
        />
      </label>

        <p className='text-red-500' >{showWarning}</p>
        
        </>      
      )}


      {convertedUrl ? (
        <a href={convertedUrl}
          download={`convertedUrl.${targetFormat}`}
          className="mt-4 text-indigo-600 underline hover:text-indigo-800"
        >
          Download Converted Image
        </a>

      ) :(
        <>
                {error && <p className='text-red-500 mt-2'> {error}</p>}

        </>
      )}

      

    </div>
  )
}
