import React from 'react'

export default function ImageInput() {
  return (
    <div className='w-full md:w-1/2 bg-gray-300 p-6 rounded shadow'>
        <h1>Upload Image</h1>
        <input type="file"
        accept='image/*'
        className='block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file-rounded file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700'
        />
      
    </div>
  )
}
