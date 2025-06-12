import mysql from "mysql2/promise";

async function setupDatabase() {
  let connection;
  try {
    // Connect as root
    connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "9302316688An@150504", // Your root password
    });

    console.log("Connected to MySQL as root");

    // Drop user if exists and recreate
    await connection.query("DROP USER IF EXISTS portfolio_user@localhost");
    console.log("Dropped existing user if any");

    // Create database if it doesn't exist
    await connection.query("CREATE DATABASE IF NOT EXISTS portfolio_db");
    console.log("Database created or already exists");

    // Create user with explicit host
    await connection.query(`
      CREATE USER 'portfolio_user'@'localhost' 
      IDENTIFIED WITH mysql_native_password BY '9302316688An@150504'
    `);
    console.log("User created");

    // Grant privileges
    await connection.query(`
      GRANT ALL PRIVILEGES ON portfolio_db.* 
      TO 'portfolio_user'@'localhost'
    `);
    console.log("Privileges granted");

    // Flush privileges
    await connection.query("FLUSH PRIVILEGES");
    console.log("Privileges flushed");

    // Test the new user
    await connection.end();
    connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "portfolio_user",
      password: "9302316688An@150504",
      database: "portfolio_db",
    });
    console.log("Successfully connected with portfolio_user");

    await connection.end();
    console.log("Database setup completed successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

setupDatabase();
