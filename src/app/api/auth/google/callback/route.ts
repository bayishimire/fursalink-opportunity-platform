import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_failed`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      return NextResponse.redirect(`${baseUrl}/login?error=token_failed`);
    }

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userInfoRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_email`);
    }

    const pool = getDb();

    // Check if user already exists
    const [existing]: any = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      [googleUser.email]
    );

    let user;

    if (existing.length > 0) {
      // Existing user — log them in directly
      user = existing[0];

      // Log login activity
      try {
        await pool.execute('INSERT INTO login_logs (user_id) VALUES (?)', [user.id]);
      } catch (_) {}

    } else {
      // New Google user — email not in system.
      // Redirect closely to the registration page to fill out missed fields
      const nameParam = encodeURIComponent(googleUser.name || googleUser.email.split('@')[0]);
      const emailParam = encodeURIComponent(googleUser.email);
      return NextResponse.redirect(`${baseUrl}/register?email=${emailParam}&name=${nameParam}&from_google=true`);
    }

    // Encode user info into redirect URL for client-side storage (for EXISTING users)
    const userData = encodeURIComponent(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: googleUser.picture,
    }));

    // If existing user somehow has pending role, use complete profile, else go to dashboard
    if (!user.role || user.role === 'pending') {
      return NextResponse.redirect(`${baseUrl}/complete-profile?user=${userData}`);
    }

    const dashboardMap: Record<string, string> = {
      admin: '/dashboard/admin',
      student: '/dashboard/student',
      user_system: '/dashboard/user_system',
    };

    const destination = dashboardMap[user.role] || '/dashboard/student';
    return NextResponse.redirect(`${baseUrl}/auth/session?user=${userData}&redirect=${destination}`);


  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`);
  }
}
