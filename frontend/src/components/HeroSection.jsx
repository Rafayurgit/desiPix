import React from 'react'
import ImageInput from './ImageInput'
import ImageOutput from './ImageOutput'
import DesiPix from "../assets/DesiPix.png";
import { useState } from 'react';
export default function HeroSection() {

const [convertedUrl, setConvertedUrl] = useState("");


  return (
    <section className="w-full py-20 bg-gradient-to-br from-indigo-50 to-white px-4">
        <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-10">

            <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to DesiPix</h1>
            <p className="text-lg text-gray-600 mb-6">Convert any image into any image extension</p>
            <button className="bg-indigo-600 hover:bg-indigo-700 transition duration-200 text-white px-6 py-2 rounded shadow-md cursor-pointer" >Get Started</button>
            </div>

            <div className="w-full md:w-1/2">
            <img src={DesiPix} alt="Hero" className="w-full" />
            </div>

            
        </div>

        <div className='container mx-auto mt-20 flex flex-col md:flex-row gap-y-8 md:gap-6 justify-between'>
                <ImageInput setConvertedUrl={setConvertedUrl} />
                <ImageOutput convertedUrl={convertedUrl} />
        </div>
    </section>

  )
}
