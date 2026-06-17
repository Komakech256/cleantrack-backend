const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
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

// A connection pool lets the app reuse database connections efficiently.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cleantrack_uganda",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
