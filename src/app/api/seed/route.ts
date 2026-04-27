import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const pool = getDb();
    
    const courses = [
      // Children
      { title: 'The Magic Alphabet', company: 'Kids Edu', level: 'children', description: 'A musical journey through letters and sounds for toddlers.' },
      { title: 'Counting Adventures', company: 'Kids Edu', level: 'children', description: 'Learn numbers 1-50 through interactive forest games.' },
      { title: 'Color Identification', company: 'Kids Edu', level: 'children', description: 'Fun painting exercises to master the rainbow colors.' },
      
      // Primary
      { title: 'Primary Mathematics', company: 'EduCenter', level: 'primary', description: 'Foundations of addition, subtraction, and multiplication.' },
      { title: 'English Grammar 101', company: 'EduCenter', level: 'primary', description: 'Master verbs, nouns, and basic sentence construction.' },
      { title: 'Our World: Science', company: 'EduCenter', level: 'primary', description: 'Introduction to plants, animals, and the environment.' },
      
      // Secondary
      { title: 'Advanced Algebra', company: 'HighSchool Hub', level: 'secondary', description: 'Complex equations and function analysis for high schoolers.' },
      { title: 'Chemical Reactions', company: 'HighSchool Hub', level: 'secondary', description: 'Understanding the periodic table and bonding mechanisms.' },
      { title: 'Biological Systems', company: 'HighSchool Hub', level: 'secondary', description: 'Deep dive into human anatomy and cellular biology.' },
      
      // Programming
      { title: 'Zero to Web Hero', company: 'CodeLab', level: 'programming', description: 'Learn HTML, CSS, and JavaScript by building 10 projects.' },
      { title: 'Backend Masterclass', company: 'CodeLab', level: 'programming', description: 'Scale applications using Node.js, Express, and MySQL.' },
      { title: 'Cybersecurity Pulse', company: 'CodeLab', level: 'programming', description: 'Protecting networks and understanding digital vulnerabilities.' },
    ];

    for (const c of courses) {
      await pool.execute(
        'INSERT INTO jobs (title, company, level, description, category, deadline) VALUES (?, ?, ?, ?, ?, ?)',
        [c.title, c.company, c.level, c.description, 'course', '2026-12-31']
      );
    }

    return NextResponse.json({ success: true, message: 'Educational Catalog Seeded with 12 Examples!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
