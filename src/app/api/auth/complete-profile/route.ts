import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const pool = getDb();
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
