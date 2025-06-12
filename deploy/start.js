// Production start script for GoDaddy hosting
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if production.env exists and copy it to .env if it does
const prodEnvPath = path.join(__dirname, "production.env");
const envPath = path.join(__dirname, ".env");

if (fs.existsSync(prodEnvPath)) {
  console.log("Using production environment configuration");
  fs.copyFileSync(prodEnvPath, envPath);
}

// Start the server
console.log("Starting server in production mode...");
const server = spawn("node", ["dist/index.js"], {
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});

server.on("error", (err) => {
  console.error("Failed to start server:", err);
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log("Shutting down server...");
  server.kill("SIGTERM");
});
