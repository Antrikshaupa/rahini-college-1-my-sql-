import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "portfolio_user",
      password: "9302316688An@150504",
      database: "portfolio_db",
    });

    console.log("Successfully connected to MySQL database!");

    // Test query
    const [rows] = await connection.execute("SHOW TABLES");
    console.log("Tables in database:", rows);

    await connection.end();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

testConnection();
