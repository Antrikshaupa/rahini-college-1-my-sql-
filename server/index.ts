// Load environment variables from .env file FIRST!
import dotenv from "dotenv";
import path from "path"; // Import the 'path' module
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly configure dotenv to look for the .env file in the parent directory
const envPath = path.resolve(__dirname, "..", ".env");
const result = dotenv.config({ path: envPath });

// Optional: Add some debugging to see if the file was loaded
if (result.error) {
  console.error("Error loading .env file:", result.error);
  console.error("Looked for .env at path:", envPath);
} else {
  console.log(".env file loaded successfully from:", envPath);
  console.log("DATABASE_URL found:", process.env.DATABASE_URL ? "Yes" : "No");
}

// Import necessary modules
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes"; // Your API route definitions
import { setupVite, serveStatic, log } from "./vite"; // Vite/static serving helpers
import { seedData } from "./seed"; // Database seeding function

// Create the Express application instance
const app = express();

// --- Core Middleware ---
// Middleware to parse incoming requests with JSON payloads
app.use(express.json());
// Middleware to parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: false }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// --- Custom Logging Middleware ---
// Logs details about incoming API requests and their responses
app.use((req, res, next) => {
  const start = Date.now(); // Record start time
  const path = req.path; // Get request path
  let capturedJsonResponse: Record<string, any> | undefined = undefined; // Variable to hold response JSON

  // Monkey-patch res.json to capture the response body for logging
  const originalResJson = res.json;
  // @ts-ignore - Ignore TypeScript error for incompatible signature if it arises
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson; // Capture the JSON body
    // Call the original res.json function, applying the original arguments
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log details when the response finishes sending
  res.on("finish", () => {
    const duration = Date.now() - start; // Calculate request duration
    // Only log requests targeting API paths
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      // Include a snippet of the JSON response if it was captured
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      // Truncate very long log lines for readability
      if (logLine.length > 150) {
        // Increased limit slightly
        logLine = logLine.slice(0, 149) + "…";
      }

      log(logLine); // Use the custom log function (likely from vite.ts)
    }
  });

  next(); // Pass control to the next middleware in the stack
});

// --- Main Server Setup (Async IIFE) ---
// Using an async IIFE allows top-level await for setup tasks
(async () => {
  // Register API routes and create the underlying HTTP server instance
  // registerRoutes likely sets up API endpoints and returns the server
  const server = await registerRoutes(app);

  // --- Generic Error Handling Middleware ---
  // This MUST be defined AFTER all your routes and other middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled Error:", err.stack || err); // Log the full error stack for debugging
    // Determine the status code from the error, defaulting to 500
    const status = err.status || err.statusCode || 500;
    // Determine the error message, defaulting to a generic one
    const message = err.message || "Internal Server Error";

    // Send a JSON error response to the client
    res.status(status).json({ message });
  });

  // --- Vite Dev Server / Static File Serving ---
  // Conditionally set up Vite middleware for development OR serve static build files for production.
  // This setup needs to come *after* API routes so the Vite/static catch-all
  // doesn't prevent API requests from being handled.
  if (process.env.NODE_ENV === "development") {
    log("Setting up Vite middleware for development...");
    // setupVite configures Vite's dev server and includes its catch-all route for index.html
    await setupVite(app, server);
  } else {
    log("Setting up static file serving for production...");
    // serveStatic serves files from the 'dist/public' directory and includes a catch-all for index.html
    serveStatic(app);
  }

  // --- Start Server Listening ---
  // Use port from environment variable or default to 5001
  const port = process.env.PORT || 5001;
  server.listen(
    {
      port,
      host: "0.0.0.0", // Listen on all available network interfaces (important for containers/deployment)
      reusePort: true, // Allows multiple processes to bind to the same port if needed
    },
    () => {
      // Log server start message
      log(
        `Server listening on port ${port} in ${
          process.env.NODE_ENV || "undefined"
        } mode`
      );

      // --- Database Seeding (Optional) ---
      // Attempt to seed the database with initial data after the server starts.
      // Using .catch() prevents seeding errors from crashing the entire server.
      log("Attempting to seed database...");
      seedData()
        .then(() => {
          log("Database seeding check complete.");
        })
        .catch((err) => {
          console.error("Error during database seeding:", err);
        });
    }
  );
})(); // End of async IIFE
