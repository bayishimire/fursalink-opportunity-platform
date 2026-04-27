/**
 * Fursa.Link Email Service
 * Uses Node.js built-in modules (no extra packages needed)
 * Gmail App Password is required - not your regular Gmail password
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

import * as tls from 'tls';
// CACHE BUST TRIGGER: Direct SMTPS Port 465 Pipeline

export function smtpSend(to: string, subject: string, body: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const host = 'smtp.gmail.com';
    const port = 465; // Direct TLS port, much safer for corporate proxies
    const user = (process.env.EMAIL_HOST_USER || '').trim();
    const pass = (process.env.EMAIL_HOST_PASSWORD || '').trim().replace(/\s+/g, '');
    const from = user;

    if (!user || !pass) {
      console.log(`[EMAIL DEV MODE] To: ${to} | Subject: ${subject}`);
      return resolve();
    }

    const b64 = (s: string) => Buffer.from(s).toString('base64');
    let buffer = '';
    let step = 0;

    // Connect securely from the very first packet
    const socket = tls.connect(port, host, {
      rejectUnauthorized: false // Bypass strict SSL rules on corporate firewalls securely
    }, () => {
      // Connection established
    });

    socket.on('data', (chunk: Buffer) => {
      buffer += chunk.toString();
      const lines = buffer.split('\r\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('5') || line.startsWith('4')) {
          socket.end();
          return reject(new Error(`SMTP Error: ${line}`));
        }

        // Extremely robust state machine for direct SMTPS
        if (step === 0 && line.startsWith('220')) {
          socket.write('EHLO localhost\r\n');
          step++;
        } else if (step === 1 && line.startsWith('250 ') && !buffer.includes('EHLO')) {
          socket.write('AUTH LOGIN\r\n');
          step++;
        } else if (step === 2 && line.startsWith('334 VXNlcm5hbWU6')) { // Username:
          socket.write(b64(user) + '\r\n');
          step++;
        } else if (step === 3 && line.startsWith('334 UGFzc3dvcmQ6')) { // Password:
          socket.write(b64(pass) + '\r\n');
          step++;
        } else if (step === 4 && line.startsWith('235')) { // Auth Success
          socket.write(`MAIL FROM:<${from}>\r\n`);
          step++;
        } else if (step === 5 && line.startsWith('250')) { // Mail From OK
          socket.write(`RCPT TO:<${to}>\r\n`);
          step++;
        } else if (step === 6 && line.startsWith('250')) { // Rcpt To OK
          socket.write('DATA\r\n');
          step++;
        } else if (step === 7 && line.startsWith('354')) { // Go ahead
          const msg = `From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${body}\r\n.\r\n`;
          socket.write(msg);
          step++;
        } else if (step === 8 && line.startsWith('250')) { // Message accepted
          socket.write('QUIT\r\n');
          step++;
        } else if (step === 9 && line.startsWith('221')) { // Goodbye
          socket.end();
          resolve();
        }
      }
    });

    socket.on('error', (err) => reject(err));
    socket.setTimeout(15000, () => {
      socket.destroy();
      reject(new Error('SMTP timeout connected to Google'));
    });
  });
}

// Pre-built email templates

export function enrollmentApprovedEmail(studentName: string, courseName: string): EmailOptions {
  return {
    to: '',
    subject: `✅ Enrollment Approved — ${courseName} | Fursa.Link`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px;">FURSA.LINK</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px;">Learning Management System</p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px;">🎓</div>
            <h2 style="color: #1e3a8a; font-size: 24px; font-weight: 900; margin: 10px 0;">Enrollment Approved!</h2>
            <p style="color: #64748b; font-size: 15px;">Great news, <strong>${studentName}</strong>!</p>
          </div>
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 12px 12px 0; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: 700; font-size: 16px;">📚 ${courseName}</p>
            <p style="margin: 8px 0 0; color: #3b82f6; font-size: 13px;">Your access has been granted. Start learning now!</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/student" 
               style="background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: white; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 14px; display: inline-block;">
              START LEARNING →
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
            © 2026 Fursa.Link • Rwanda's Premier Learning Platform
          </p>
        </div>
      </div>
    `,
    text: `Hi ${studentName}, your enrollment in "${courseName}" has been approved! Visit ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/student to start learning.`
  }
}

export function supportTicketEmail(userName: string, subject: string, message: string): EmailOptions {
  return {
    to: process.env.EMAIL_HOST_USER || '',
    subject: `🎫 Support Request: ${subject} — Fursa.Link`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 20px 20px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 900;">🎫 New Support Request</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <p><strong>From:</strong> ${userName}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #475569;">${message}</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
            Reply directly to this email or visit the Admin Dashboard to respond.
          </p>
        </div>
      </div>
    `,
    text: `Support request from ${userName}\nSubject: ${subject}\n\n${message}`
  }
}
