import React from 'react'
import ImageInput from './ImageInput'
import ImageOutput from './ImageOutput'

export default function HeroSection() {
  return (
    <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center">

            <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to DesiPix</h1>
            <p className="text-lg text-gray-600 mb-6">Conver any image into any image extension</p>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded">Get Started</button>
            </div>

            <div className="md:w-1/2">
            <img src="/assets/hero.png" alt="Hero" className="w-full" />
            </div>

            
        </div>

        <div className='container mx-auto px-4 flex flex-col md:flex-row gap-6 justify-between'>
                <ImageInput/>
                <ImageOutput/>
        </div>
    </section>

  )
}
