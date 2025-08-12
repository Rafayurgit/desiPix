import React from 'react'

export default function ProgressBar( {progress}) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
      <div
        className="bg-indigo-600 h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
