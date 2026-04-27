import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

import fs from 'fs/promises';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pool = getDb();
    await pool.execute('DELETE FROM jobs WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const title = body.title || null;
    const company = body.company || null;
    const deadline = body.deadline || null;
    const url = body.url || null;
    const description = body.description || null;
    const location = body.location || null;
    const start_date = body.start_date || null;
    const experience = body.experience || 'Not Required';
    const category = body.category || 'job';
    const image = body.image || null;

    let image_url = null;
    if (image && image.startsWith('data:')) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `${category}_${Date.now()}.png`;
        await fs.mkdir('./public/uploads', { recursive: true });
        await fs.writeFile(`./public/uploads/${fileName}`, buffer);
        image_url = `/uploads/${fileName}`;
      }
    }

    const pool = getDb();
    
    let query = 'UPDATE jobs SET title=?, company=?, deadline=?, application_url=?, description=?, location=?, start_date=?, experience=?, category=?';
    const values = [title, company, deadline, url, description, location, start_date, experience, category];
    
    if (image_url) {
      query += ', image_url=?';
      values.push(image_url);
    }
    
    query += ' WHERE id=?';
    values.push(id);

    await pool.execute(query, values);

    return NextResponse.json({ success: true, message: 'Updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
