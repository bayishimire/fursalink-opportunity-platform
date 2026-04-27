import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const pool = getDb();
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role, picture, is_verified, created_at FROM users ORDER BY created_at DESC'
    );

    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, username, role, picture } = await request.json();
    const pool = getDb();

    // Use native crypto for a simple hash to avoid dependency issues
    const hashedPassword = crypto.createHash('sha256').update('Fursa123!').digest('hex');

    await pool.execute(
      'INSERT INTO users (name, email, password, role, picture, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'student', picture || null, true]
    );

    return NextResponse.json({ message: 'User authorized successfully' });
  } catch (error: any) {
    console.error('Error onboarding user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
