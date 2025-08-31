import dotenv from "dotenv";
import app from "./app.js"
import { imageService } from "./services/image.service.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

setInterval(() => {
  console.log("Running periodic cache cleanup");
  imageService.cleanupCache?.();
}, 60 * 60 * 1000);

const server = app.listen(PORT, ()=>{
    console.log(`App is listining on http://localhost:${PORT}`);    
})



server.keepAliveTimeout = 120000;
server.headersTimeout = 120100;
