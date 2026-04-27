import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { name, role, email, picture } = await request.json();
    const pool = getDb();

    await pool.execute(
      'UPDATE users SET name = ?, role = ?, email = ?, picture = ? WHERE id = ?',
      [name, role, email, picture, userId]
    );

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const pool = getDb();

    // 1. Delete user activity and support requests first (foreign key constraints without cascade)
    await pool.execute('DELETE FROM user_activity WHERE user_id = ?', [userId]);
    await pool.execute('DELETE FROM support_requests WHERE user_id = ?', [userId]);

    // 2. Delete the user (other tables like applications have ON DELETE CASCADE)
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
