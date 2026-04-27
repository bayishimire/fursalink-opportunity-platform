import mysql from 'mysql2/promise';
import fs from 'fs';

async function main() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envFile.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val !== undefined) env[key.trim()] = val.trim();
  });

  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'fursa_link',
  });

  console.log('Creating jobs table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      deadline VARCHAR(100) NOT NULL,
      application_url VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('Creating scholarships table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS scholarships (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      provider VARCHAR(255) NOT NULL,
      amount VARCHAR(100) NOT NULL,
      application_url VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("Tables created successfully!");
  process.exit(0);
}

main().catch(console.error);
