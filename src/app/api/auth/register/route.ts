import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { smtpSend } from '@/lib/email';
import { getOtpEmailHtml } from '@/lib/email-templates';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const pool = getDb();
    
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    // Format manually to avoid UTC conversion from .toISOString()
    const sqlExpiry = expiryDate.getFullYear() + '-' +
      String(expiryDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(expiryDate.getDate()).padStart(2, '0') + ' ' +
      String(expiryDate.getHours()).padStart(2, '0') + ':' +
      String(expiryDate.getMinutes()).padStart(2, '0') + ':' +
      String(expiryDate.getSeconds()).padStart(2, '0');

    // Store user with false verification and OTP details
    const [result]: any = await pool.execute(
      'INSERT INTO users (name, email, password, role, is_verified, otp_code, otp_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, role, 0, otpCode, sqlExpiry]
    );

    const emailHtml = getOtpEmailHtml(name, otpCode, true);

    try {
      await smtpSend(email, 'Fursa.Link - Your Verification Code', emailHtml);
    } catch (e) {
      console.error('Failed to send OTP email', e);
    }

    return NextResponse.json({ message: 'User created, OTP sent', userId: result.insertId }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
