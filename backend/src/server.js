import dotenv from "dotenv";
import app from "./app.js"

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, ()=>{
    console.log(`App is listining on http://localhost:${PORT}`);    
})

server.keepAliveTimeout = 120000;
server.headersTimeout = 120100;
