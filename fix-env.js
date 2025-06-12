import fs from "fs";

const envContent = `DATABASE_URL=postgresql://neondb_owner:npg_Cuc8MFQ3gKWY@ep-lucky-mode-a4pb55xi.us-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=development`;

fs.writeFileSync(".env", envContent);
console.log(".env file created successfully");
