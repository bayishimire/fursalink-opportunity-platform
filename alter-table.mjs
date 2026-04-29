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

  const columns = [
    'image_url TEXT',
    'location VARCHAR(255)',
    'start_date VARCHAR(100)',
    'experience VARCHAR(100)',
    'category VARCHAR(50)',
    'level VARCHAR(50)',
    'video_url TEXT',
    'exam_url TEXT'
  ];

  for (const col of columns) {
    try {
      const colName = col.split(' ')[0];
      await connection.execute(`ALTER TABLE jobs ADD COLUMN ${col}`);
      console.log(`Column ${colName} added to jobs table!`);
    } catch(e) {
      // Ignore if column already exists
    }
  }

  // Scholarships might need the same columns if they shared the same POST endpoint?
  // Actually, api/jobs seems to be the main one used in AdminDashboard for all types.
  // Wait, let's verify if scholarships and courses use a different API.
  // In AdminDashboard:
  // const categoryMap = { jobs: 'job', scholarships: 'scholarship', courses: 'course' };
  // const category = (categoryMap as any)[activeTab] || 'job';
  // await fetch('/api/jobs', ... { ...jobForm, category ... })
  
  // So everything is stored in the `jobs` table with a `category` field!
  
  process.exit(0);
}

main().catch(console.error);
