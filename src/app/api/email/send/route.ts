import { NextResponse } from 'next/server';
import * as net from 'net';
import * as tls from 'tls';

function smtpSend(opts: {
  host: string; port: number; user: string; pass: string;
  from: string; to: string; subject: string; body: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const b64 = (s: string) => Buffer.from(s).toString('base64');
    let socket: tls.TLSSocket | null = null;
    let tlsHandled = false;
    let buffer = '';

    const plain = net.createConnection(opts.port, opts.host);
    plain.on('data', (chunk: Buffer) => {
      buffer += chunk.toString();
      const lines = buffer.split('\r\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!tlsHandled) {
          if (line.startsWith('220 ') && !plain.destroyed) {
            plain.write('EHLO localhost\r\n');
          } else if (line.includes('STARTTLS')) {
            plain.write('STARTTLS\r\n');
          } else if (line.startsWith('220 Go ahead') || line.startsWith('220 2.0.0')) {
            tlsHandled = true;
            socket = tls.connect({ socket: plain, host: opts.host }, () => {
              socket!.write('EHLO localhost\r\n');
            });
            let tlsBuf = '';
            socket.on('data', (d: Buffer) => {
              tlsBuf += d.toString();
              const tls_lines = tlsBuf.split('\r\n');
              tlsBuf = tls_lines.pop() || '';
              for (const tl of tls_lines) {
                if (tl.includes('AUTH LOGIN') || (tl.startsWith('250') && tl.includes('AUTH'))) {
                  socket!.write('AUTH LOGIN\r\n');
                } else if (tl.startsWith('334 VXNlcm5hbWU6')) {
                  socket!.write(b64(opts.user) + '\r\n');
                } else if (tl.startsWith('334 UGFzc3dvcmQ6')) {
                  socket!.write(b64(opts.pass) + '\r\n');
                } else if (tl.startsWith('235')) {
                  socket!.write(`MAIL FROM:<${opts.from}>\r\n`);
                } else if (tl.startsWith('250') && tlsBuf.includes('MAIL')) {
                  socket!.write(`RCPT TO:<${opts.to}>\r\n`);
                } else if (tl.startsWith('250') && tlsBuf.includes('RCPT')) {
                  socket!.write('DATA\r\n');
                } else if (tl.startsWith('354')) {
                  const msg = `From: ${opts.from}\r\nTo: ${opts.to}\r\nSubject: ${opts.subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${opts.body}\r\n.\r\n`;
                  socket!.write(msg);
                } else if (tl.startsWith('250 2.0.0') || tl.startsWith('250 OK')) {
                  socket!.write('QUIT\r\n');
                  socket!.end();
                  resolve();
                } else if (tl.startsWith('5')) {
                  reject(new Error(`SMTP Error: ${tl}`));
                }
              }
            });
            socket.on('error', reject);
          }
        }
      }
    });
    plain.on('error', reject);
    plain.setTimeout(15000, () => reject(new Error('SMTP timeout')));
  });
}

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();
    const user = (process.env.EMAIL_HOST_USER || '').trim();
    const pass = (process.env.EMAIL_HOST_PASSWORD || '').trim();

    if (!user || !pass || !to) {
      console.log(`[EMAIL QUEUED] To: ${to} | Subject: ${subject}`);
      return NextResponse.json({ success: true, note: 'Email credentials not set — logged only' });
    }

    await smtpSend({
      host: 'smtp.gmail.com',
      port: 587,
      user,
      pass,
      from: user,
      to,
      subject,
      body: html || '',
    });

    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Email API Error]', error.message);
    // Don't fail the main request — email is non-critical
    return NextResponse.json({ success: false, note: error.message });
  }
}
