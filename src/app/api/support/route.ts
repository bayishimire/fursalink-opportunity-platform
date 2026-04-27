import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      user_id, name, email, phone, 
      job_id, job_title, education, 
      skills, experience, message 
    } = body;

    if (!name || !email || !job_title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getDb();
    
    await pool.execute(
      `INSERT INTO support_requests (
        user_id, name, email, phone, 
        job_id, job_title, education, 
        skills, experience, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id || null, name, email, phone || null,
        job_id || null, job_title, education || null,
        skills || null, experience || null, message || null
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Your support request has been submitted successfully! An admin will contact you soon.' 
    });
  } catch (error: any) {
    console.error('Support submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
