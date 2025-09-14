import sharp from "sharp";
import Jimp from "jimp";
import potrace from "potrace";
import fs from "fs/promises";
import path from "path";
import { createEmbeddedSvg, imageMagickToSvg } from "../services/svgFallback.service.js";

// export async function rasterToSvg(inputPath) {
//   const outputPath = inputPath + ".svg";
//   return new Promise((resolve, reject) => {
//     potrace.trace(inputPath, {
//       // You can customize params, e.g. threshold, color, background, etc.
//       threshold: 128,
//       color: 'black',
//       background: 'white',
//     }, async (err, svg) => {
//       if (err) return reject(err);
//       await fs.writeFile(outputPath, svg);
//       resolve(outputPath);
//     });
//   });
// }
// utils/rasterToSvg.js


// export async function rasterToSvg(inputPath) {
//   const tempPng = inputPath + ".trace.png";
//   const outputPath = inputPath + ".svg";

//   // Always normalize input into PNG so Jimp/Potrace can read it
//   await sharp(inputPath).toFormat("png").toFile(tempPng);

//   const image = await Jimp.read(tempPng);

//   return new Promise((resolve, reject) => {
//     const tracer = new Potrace();
//     tracer.loadImage(image, async (err) => {
//       if (err) return reject(err);
//       const svg = tracer.getSVG();
//       await fs.writeFile(outputPath, svg);

//       // Cleanup temp png
//       try {
//         await fs.unlink(tempPng);
//       } catch (e) {
//         console.warn("Could not delete temp PNG:", e.message);
//       }

//       resolve(outputPath);
//     });
//   });
// }




// export async function rasterToSvg(inputPath) {
//   const outputPath = inputPath + ".svg";
//   const tempPngPath = inputPath + ".temp.png";
  
//   try {
//     // First, convert input to PNG since potrace works best with PNG
//     console.log("Converting input to PNG for potrace processing...");
    
//     await sharp(inputPath)
//       .png()
//       .toFile(tempPngPath);
    
//     console.log("Starting potrace conversion to SVG...");
    
//     return new Promise((resolve, reject) => {
//       potrace.trace(tempPngPath, {
//         threshold: 128,
//         color: 'black',
//         background: 'transparent', // Changed to transparent for better SVG
//         turnPolicy: potrace.Jimp.TURNPOLICY_MINORITY,
//         turdSize: 2,
//         optCurve: true,
//         optTolerance: 0.2,
//         alphaMax: 1.0
//       }, async (err, svg) => {
//         if (err) {
//           console.error("Potrace conversion failed:", err);
          
//           // Cleanup temp file
//           try {
//             await fs.unlink(tempPngPath);
//           } catch (e) {}
          
//           // Try fallback methods
//           try {
//             console.log("Trying ImageMagick fallback for SVG conversion...");
//             const result = await imageMagickToSvg(inputPath);
//             resolve(result);
//             return;
//           } catch (imagickError) {
//             console.log("ImageMagick failed, trying embedded SVG fallback...");
//             try {
//               const result = await createEmbeddedSvg(inputPath);
//               resolve(result);
//               return;
//             } catch (embedError) {
//               return reject(new Error(`All SVG conversion methods failed. Potrace: ${err.message}, ImageMagick: ${imagickError.message}, Embed: ${embedError.message}`));
//             }
//           }
//         }
        
//         try {
//           // Write the SVG content to file
//           await fs.writeFile(outputPath, svg);
//           console.log("SVG conversion successful:", outputPath);
          
//           // Cleanup temp PNG file
//           try {
//             await fs.unlink(tempPngPath);
//           } catch (e) {
//             console.warn("Could not cleanup temp PNG file:", e.message);
//           }
          
//           resolve(outputPath);
//         } catch (writeErr) {
//           console.error("Failed to write SVG file:", writeErr);
          
//           // Cleanup temp file
//           try {
//             await fs.unlink(tempPngPath);
//           } catch (e) {}
          
//           // Try fallback methods
//           try {
//             console.log("Trying ImageMagick fallback after write failure...");
//             const result = await imageMagickToSvg(inputPath);
//             resolve(result);
//           } catch (imagickError) {
//             try {
//               console.log("Trying embedded SVG fallback after write failure...");
//               const result = await createEmbeddedSvg(inputPath);
//               resolve(result);
//             } catch (embedError) {
//               reject(new Error(`Failed to write SVG file and all fallbacks failed: ${writeErr.message}`));
//             }
//           }
//         }
//       });
//     });
    
//   } catch (error) {
//     console.error("Error in rasterToSvg preprocessing:", error);
    
//     // Cleanup temp file if it exists
//     try {
//       await fs.unlink(tempPngPath);
//     } catch (e) {}
    
//     // Try fallback methods
//     try {
//       console.log("Trying ImageMagick fallback after preprocessing error...");
//       return await imageMagickToSvg(inputPath);
//     } catch (imagickError) {
//       try {
//         console.log("Trying embedded SVG fallback after preprocessing error...");
//         return await createEmbeddedSvg(inputPath);
//       } catch (embedError) {
//         throw new Error(`Raster to SVG conversion failed: ${error.message}. All fallbacks failed.`);
//       }
//     }
//   }
// }


export const SvgConversionMode = {
  VECTOR_FIRST: "vector_first",
  STABLE_FIRST: "stable_first",
};

// Unified rasterToSvg
export async function rasterToSvg(inputPath, mode = SvgConversionMode.STABLE_FIRST) {
  console.log(`Starting raster→SVG conversion in mode: ${mode}`);

  const tryPotrace = async () => {
    let potrace;
    try {
      potrace = await import("potrace");
      potrace = potrace.default || potrace;
    } catch (err) {
      throw new Error(`Potrace not available: ${err.message}`);
    }

    if (!potrace?.trace) {
      throw new Error("Potrace module loaded but no trace() function found");
    }

    const outputPath = inputPath + ".svg";
    const tempPngPath = inputPath + ".temp.png";

    try {
      await sharp(inputPath).png().toFile(tempPngPath);

      return await new Promise((resolve, reject) => {
        potrace.trace(
          tempPngPath,
          {
            threshold: 128,
            color: "black",
            background: "transparent",
            turdSize: 2,
            optCurve: true,
            optTolerance: 0.2,
            alphaMax: 1.0,
          },
          async (err, svg) => {
            try {
              await fs.unlink(tempPngPath);
            } catch {}

            if (err) return reject(new Error(`Potrace failed: ${err.message}`));

            try {
              await fs.writeFile(outputPath, svg);
              console.log("Potrace SVG conversion successful:", outputPath);
              resolve(outputPath);
            } catch (writeErr) {
              reject(new Error(`Failed to write Potrace SVG: ${writeErr.message}`));
            }
          }
        );
      });
    } finally {
      try {
        await fs.unlink(tempPngPath);
      } catch {}
    }
  };

  // Define pipeline order
  const pipelines =
    mode === SvgConversionMode.VECTOR_FIRST
      ? [tryPotrace, imageMagickToSvg, createEmbeddedSvg]
      : [imageMagickToSvg, createEmbeddedSvg, tryPotrace];

  // Run pipeline in order
  for (const step of pipelines) {
    try {
      return await step(inputPath);
    } catch (err) {
      console.warn(`${step.name || "Unknown step"} failed: ${err.message}`);
    }
  }

  throw new Error("All SVG conversion methods failed");
}
