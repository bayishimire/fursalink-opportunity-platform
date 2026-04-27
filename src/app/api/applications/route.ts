import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, job_id } = body;

    if (!user_id || !job_id) {
      return NextResponse.json({ error: 'Missing user_id or job_id' }, { status: 400 });
    }

    const pool = getDb();
    
    // Check if already applied
    const [existing]: any = await pool.execute(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ?',
      [user_id, job_id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already applied for this opportunity' }, { status: 400 });
    }

    await pool.execute(
      'INSERT INTO applications (user_id, job_id) VALUES (?, ?)',
      [user_id, job_id]
    );

    return NextResponse.json({ success: true, message: 'Submitted successfully!' });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const pool = getDb();
    const [rows]: any = await pool.execute(`
      SELECT a.*, u.name as user_name, u.email as user_email, j.title as job_title, j.category as job_category 
      FROM applications a 
      JOIN users u ON a.user_id = u.id 
      JOIN jobs j ON a.job_id = j.id 
      ORDER BY a.applied_at DESC
    `);
    return NextResponse.json({ applications: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const pool = getDb();
    await pool.execute('UPDATE applications SET status = ? WHERE id = ?', [status, id]);

    // Send email notification when enrollment is APPROVED
    if (status === 'approved') {
      try {
        const [appRows]: any = await pool.execute(`
          SELECT u.name as user_name, u.email as user_email, j.title as course_title
          FROM applications a
          JOIN users u ON a.user_id = u.id
          JOIN jobs j ON a.job_id = j.id
          WHERE a.id = ?
        `, [id]);

        if (appRows.length > 0) {
          const { user_name, user_email, course_title } = appRows[0];
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

          // Fire-and-forget email
          fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: user_email,
              subject: `✅ Enrollment Approved — ${course_title} | Fursa.Link`,
              html: `
                <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:40px 20px;">
                  <div style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);padding:40px;border-radius:20px 20px 0 0;text-align:center;">
                    <h1 style="color:white;margin:0;font-size:28px;font-weight:900;">FURSA.LINK</h1>
                    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">Learning Management System</p>
                  </div>
                  <div style="background:white;padding:40px;border-radius:0 0 20px 20px;">
                    <div style="text-align:center;margin-bottom:30px;">
                      <div style="font-size:48px;">🎓</div>
                      <h2 style="color:#1e3a8a;font-size:24px;font-weight:900;">Enrollment Approved!</h2>
                      <p style="color:#64748b;">Great news, <strong>${user_name}</strong>!</p>
                    </div>
                    <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:20px;border-radius:0 12px 12px 0;margin:20px 0;">
                      <p style="margin:0;color:#1e40af;font-weight:700;font-size:16px;">📚 ${course_title}</p>
                      <p style="margin:8px 0 0;color:#3b82f6;font-size:13px;">Your access has been granted. Start learning now!</p>
                    </div>
                    <div style="text-align:center;margin-top:30px;">
                      <a href="${baseUrl}/dashboard/student" style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:white;padding:14px 36px;border-radius:12px;text-decoration:none;font-weight:900;font-size:14px;display:inline-block;">START LEARNING →</a>
                    </div>
                    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:30px;">© 2026 Fursa.Link • Rwanda's Premier Learning Platform</p>
                  </div>
                </div>
              `,
              text: `Hi ${user_name}, your enrollment in "${course_title}" has been approved! Visit ${baseUrl}/dashboard/student to start learning.`
            })
          }).catch(err => console.error('[Email Trigger Error]', err));
        }
      } catch (emailErr) {
        console.error('[Email Fetch Error]', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
