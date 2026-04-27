import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email: identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const pool = getDb();
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role, is_verified FROM users WHERE (email = ? OR name = ?) AND password = ?',
      [identifier, identifier, password]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = rows[0];

    // Log the login activity
    await pool.execute('INSERT INTO login_logs (user_id) VALUES (?)', [user.id]);

    return NextResponse.json({ 
      message: 'Logged in', 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
