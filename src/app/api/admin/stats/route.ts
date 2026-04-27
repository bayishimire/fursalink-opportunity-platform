import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const pool = getDb();
    
    // 1. Registrations Today
    const [regRows]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()'
    );
    const registrationsToday = regRows[0].count;

    // Total Users
    const [totalUsersRows]: any = await pool.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalUsersRows[0].count;

    // 2. Active Logins Today
    const [loginRows]: any = await pool.execute(
      'SELECT COUNT(DISTINCT user_id) as count FROM login_logs WHERE DATE(logged_at) = CURDATE()'
    );
    const activeLogins = loginRows[0].count;

    // 3. Applications Sent Today
    const [appRows]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM applications WHERE DATE(applied_at) = CURDATE()'
    );
    const applicationsSent = appRows[0].count;

    // 4. Jobs Posted Today
    const [jobsPostedRows]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE DATE(id) = CURDATE() OR id IS NOT NULL' // Simplified for now since we don't have created_at on jobs yet
    );
    // Actually let's just use a real count of total jobs
    const [totalJobsRows]: any = await pool.execute('SELECT COUNT(*) as count FROM jobs');
    const totalJobs = totalJobsRows[0].count;

    // 4. Detailed Data for Clickable Views
    const [recentRegs]: any = await pool.execute(
      'SELECT name, email, role, created_at FROM users WHERE DATE(created_at) = CURDATE() ORDER BY created_at DESC'
    );
    
    const [recentLogins]: any = await pool.execute(
      'SELECT u.name, u.email, l.logged_at FROM login_logs l JOIN users u ON l.user_id = u.id WHERE DATE(l.logged_at) = CURDATE() ORDER BY l.logged_at DESC'
    );

    const [recentApps]: any = await pool.execute(
      'SELECT u.name, j.title as job, a.applied_at FROM applications a JOIN users u ON a.user_id = u.id JOIN jobs j ON a.job_id = j.id WHERE DATE(a.applied_at) = CURDATE() ORDER BY a.applied_at DESC'
    );

    // 5. Growth Data (Last 7 Days)
    const [growthRows]: any = await pool.execute(`
      SELECT DATE(created_at) as day, COUNT(*) as count 
      FROM users 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);

    return NextResponse.json({
      summary: {
        registrationsToday,
        activeLogins,
        applicationsSent,
        totalUsers,
        totalJobs
      },
      details: {
        registrations: recentRegs,
        logins: recentLogins,
        applications: recentApps
      },
      growth: growthRows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
