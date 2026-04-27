import mysql from 'mysql2/promise';
import fs from 'fs';

async function main() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envFile.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val !== undefined) env[key.trim()] = val.trim();
  });

  const connection = await mysql.createConnection({
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'fursa_link',
  });

  try {
    await connection.execute(`ALTER TABLE jobs ADD COLUMN image_url TEXT`);
    console.log('image_url column added to jobs table!');
  } catch(e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists!');
    } else {
      console.error(e);
    }
  }

  try {
    await connection.execute(`ALTER TABLE scholarships ADD COLUMN image_url TEXT`);
    console.log('image_url column added to scholarships table!');
  } catch(e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists!');
    } else {
      console.error(e);
    }
  }

  process.exit(0);
}

main().catch(console.error);
