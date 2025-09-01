import dotenv from "dotenv";
import app from "./app.js";
import { runCleanup, scheduleCleanup } from "./utils/cleanup.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// periodic cleanup
const cleanupInterval = scheduleCleanup();

// start server
const server = app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 120100;

// graceful shutdown
async function shutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  clearInterval(cleanupInterval);
  await runCleanup(`shutdown via ${signal}`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT (Ctrl+C)"));
process.on("SIGTERM", () => shutdown("SIGTERM (external stop)"));
