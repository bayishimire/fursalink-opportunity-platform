import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { smtpSend } from '@/lib/email';
import { getOtpEmailHtml } from '@/lib/email-templates';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const pool = getDb();
    
    // Fetch user details to ensure they exist
    const [rows]: any = await pool.execute('SELECT id, name, is_verified FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = rows[0];

    if (user.is_verified) {
      return NextResponse.json({ message: 'Account is already verified' }, { status: 400 });
    }

    // Generate NEW 6-digit OTP
    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    // Format manually to avoid UTC conversion from .toISOString()
    const sqlExpiry = newExpiryDate.getFullYear() + '-' +
      String(newExpiryDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(newExpiryDate.getDate()).padStart(2, '0') + ' ' +
      String(newExpiryDate.getHours()).padStart(2, '0') + ':' +
      String(newExpiryDate.getMinutes()).padStart(2, '0') + ':' +
      String(newExpiryDate.getSeconds()).padStart(2, '0');

    // Update database with new OTP
    await pool.execute(
      'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?',
      [newOtpCode, sqlExpiry, email]
    );

    const emailHtml = getOtpEmailHtml(user.name, newOtpCode, false);

    try {
      await smtpSend(email, 'Fursa.Link - Your NEW Verification Code', emailHtml);
    } catch (e) {
      console.error('Failed to resend OTP email', e);
    }

    return NextResponse.json({ message: 'New OTP code sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ message: 'Server error during OTP resend' }, { status: 500 });
  }
}
