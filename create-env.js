import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=portfolio_user
MYSQL_PASSWORD=9302316688An@150504
MYSQL_DATABASE=portfolio_db
NODE_ENV=development
PORT=5000
`;

const envPath = path.resolve(__dirname, ".env");

try {
  fs.writeFileSync(envPath, envContent);
  console.log(".env file created successfully at:", envPath);
} catch (error) {
  console.error("Error creating .env file:", error);
  process.exit(1);
}
