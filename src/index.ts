#!/usr/bin/env node

/**
 * Toivo Backend - Main Entry Point
 * 
 * This is the main entry point for the Toivo backend application.
 * It initializes the server and handles any uncaught exceptions.
 */

import { startServer } from './server.js';
import { serverConfig } from './config/app.config.js';

// Log startup information
console.log(`\n🚀 Starting Toivo Backend (${serverConfig.environment})...`);
console.log(`📅 ${new Date().toLocaleString()}`);
console.log(`🌐 Environment: ${serverConfig.environment}`);
console.log(`💻 PID: ${process.pid}`);
console.log(`📂 Working directory: ${process.cwd()}\n`);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider restarting the process in production using PM2 or similar
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider restarting the process in production using PM2 or similar
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
