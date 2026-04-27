import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    const pool = getDb();
    
    // Fetch user and OTP details
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, role, otp_code, otp_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = rows[0];

    // Check if OTP matches
    if (user.otp_code !== otp) {
      return NextResponse.json({ message: 'Invalid OTP code' }, { status: 400 });
    }

    // Check if OTP has expired (15-minute rule)
    const now = new Date();
    // Use the string directly from DB to avoid double UTC conversion
    const expiryDate = new Date(user.otp_expires_at);

    console.log(`[OTP DEBUG] Current Time (UTC): ${now.toISOString()}`);
    console.log(`[OTP DEBUG] Expiry Time (Raw from DB): ${user.otp_expires_at}`);
    console.log(`[OTP DEBUG] Expiry Time (Parsed): ${expiryDate.toISOString()}`);

    if (now.getTime() > expiryDate.getTime()) {
      return NextResponse.json({ message: 'OTP expired. Please request a new code.' }, { status: 400 });
    }

    // Success! Verify the user and clear OTP
    await pool.execute(
      'UPDATE users SET is_verified = 1, otp_code = NULL, otp_expires_at = NULL WHERE email = ?',
      [email]
    );

    return NextResponse.json({ 
      message: 'Email verified successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: 1
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json({ message: 'Server error during verification' }, { status: 500 });
  }
}
