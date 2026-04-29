import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

import fs from 'fs/promises';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = body.title || null;
    const company = body.company || null;
    const deadline = body.deadline || null;
    const url = body.url || null;
    const description = body.description || null;
    const image = body.image || null;
    const location = body.location || null;
    const start_date = body.startDate || body.start_date || null;
    const experience = body.experience || 'Not Required';
     const category = body.category || 'job';
    const level = body.level || 'programming';
    const video_url = body.video_url || null;
    const exam_url = body.exam_url || null;

    if (!title || !company || !deadline || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let image_url = image; // Store Base64 directly for Vercel/Cloud compatibility

    const pool = getDb();
    
    const [result] = await pool.execute(
      'INSERT INTO jobs (title, company, deadline, application_url, description, image_url, location, start_date, experience, category, level, video_url, exam_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, company, deadline, url, description, image_url, location, start_date, experience, category, level, video_url, exam_url]
    );

    return NextResponse.json({ success: true, message: 'Published successfully!' }, { status: 201 });
  } catch (error: any) {
    console.error('Creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const pool = getDb();
    const [rows]: any = await pool.execute('SELECT * FROM jobs ORDER BY id DESC');
    return NextResponse.json({ jobs: rows }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
