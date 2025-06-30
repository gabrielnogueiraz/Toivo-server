import { startServer } from "./server.js";
import { serverConfig } from "./config/app.config.js";

console.log(`\n🚀 Starting Toivo Backend (${serverConfig.environment})...`);
console.log(`📅 ${new Date().toLocaleString()}`);
console.log(`🌐 Environment: ${serverConfig.environment}`);
console.log(`💻 PID: ${process.pid}`);
console.log(`📂 Working directory: ${process.cwd()}\n`);
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
