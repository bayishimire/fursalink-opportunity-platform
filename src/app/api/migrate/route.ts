import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const pool = getDb();

    // 1. Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin', 'user') DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Jobs/Opportunities table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        application_url TEXT,
        deadline VARCHAR(50),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Applications table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        job_id INT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      )
    `);

    // 4. Support Requests table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS support_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        subject VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 5. User Activity/Logins table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 6. Add level to jobs table for Student System
    try {
      await pool.execute("ALTER TABLE jobs ADD COLUMN level VARCHAR(50) DEFAULT 'programming'");
    } catch (e) {
      console.log('level column exists');
    }

    // 7. Add video_url to jobs table
    try {
      await pool.execute("ALTER TABLE jobs ADD COLUMN video_url VARCHAR(255) DEFAULT NULL");
    } catch (e) {
      console.log('video_url column exists');
    }

    // 8. Add exam_url to jobs table
    try {
      await pool.execute("ALTER TABLE jobs ADD COLUMN exam_url VARCHAR(255) DEFAULT NULL");
    } catch (e) {
      console.log('exam_url column exists');
    }

    // 9. Add picture to users table for profile avatars
    try {
      await pool.execute("ALTER TABLE users ADD COLUMN picture LONGTEXT DEFAULT NULL");
    } catch (e) {
      console.log('picture column exists');
    }

    // 10. Add OTP Columns for Email Verification
    try {
      await pool.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE");
      await pool.execute("ALTER TABLE users ADD COLUMN otp_code VARCHAR(10) DEFAULT NULL");
      await pool.execute("ALTER TABLE users ADD COLUMN otp_expires_at DATETIME DEFAULT NULL");
    } catch (e) {
      console.log('OTP columns already exist');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database schema synchronized with Video & Exam Support!' 
    });
  } catch (error: any) {
    console.error('Migration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
