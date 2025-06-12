-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS portfolio_db;

-- Create the user if it doesn't exist
CREATE USER IF NOT EXISTS 'portfolio_user'@'localhost' IDENTIFIED BY '9302316688An@150504';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES; 