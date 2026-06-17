const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

// Fallback .env parsing if dotenv doesn't load
if (!process.env.DB_HOST) {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    const envVars = {};
    envContent.split(/\r?\n/).forEach(line => {
      line = line.trim();
      if (line && !line.startsWith("#")) {
        const eqIndex = line.indexOf("=");
        if (eqIndex > 0) {
          const key = line.substring(0, eqIndex).trim();
          const value = line.substring(eqIndex + 1).trim();
          envVars[key] = value;
        }
      }
    });
    Object.assign(process.env, envVars);
  }
}

const runSqlFile = async (connection, fileName) => {
  const filePath = path.join(__dirname, "..", "database", fileName);
  const sql = fs.readFileSync(filePath, "utf8");
  await connection.query(sql);
};

const setupDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true
  });

  await runSqlFile(connection, "schema.sql");
  await runSqlFile(connection, "seed.sql");
  await connection.end();

  console.log("CleanTrack Uganda database schema and seed data loaded.");
};

setupDatabase().catch((error) => {
  console.error("Database setup failed:", error.message);
  process.exit(1);
});
