import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const pool = getDb();
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role, picture, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (error: any) {
    console.error('Profile Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, picture } = body;

    if (!id || !picture) {
      return NextResponse.json({ error: 'Missing id or picture' }, { status: 400 });
    }

    const pool = getDb();
    await pool.execute('UPDATE users SET picture = ? WHERE id = ?', [picture, id]);

    // Fetch the updated user correctly
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role, picture, created_at FROM users WHERE id = ?',
      [id]
    );

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (error: any) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
