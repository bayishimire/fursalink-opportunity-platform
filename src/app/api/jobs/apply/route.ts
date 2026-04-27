import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId, jobId } = await req.json();
    if (!userId || !jobId) return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });

    const pool = getDb();
    await pool.execute('INSERT INTO applications (user_id, job_id) VALUES (?, ?)', [userId, jobId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
