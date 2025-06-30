import { buildApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.config.js';
import { serverConfig } from './config/app.config.js';
import { scheduleLaunchEmailJob } from './jobs/sendLaunchEmails.js';

async function startServer() {
  try {
    const app = await buildApp();

    await connectDB();

    if (serverConfig.isProduction || process.env.RUN_JOBS === "true") {
      scheduleLaunchEmailJob();
    }

    const address = await app.listen({
      port: serverConfig.port,
      host: serverConfig.host,
    });

    console.log(`\n🚀 Server is running at ${address}`);
    console.log(`📚 API Documentation available at ${address}/docs\n`);

    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
        await app.close();
        await disconnectDB();
        process.exit(0);
      });
    });

    return app;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// This allows the file to be run directly
if (import.meta.url.endsWith(process.argv[1])) {
  startServer().catch(console.error);
}

export { startServer };
