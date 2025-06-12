import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, ".env");
console.log("Creating .env at:", envPath);

// Create the .env file with the correct content
const envContent = `DATABASE_URL=postgresql://neondb_owner:npg_Cuc8MFQ3gKWY@ep-lucky-mode-a4pb55xi.us-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=development`;

fs.writeFileSync(envPath, envContent);
console.log(".env file created successfully");

// Load the environment variables
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log(".env file loaded successfully");
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
}
