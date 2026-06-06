import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';
import { COURSES } from '@/lib/courses';

// GET /api/admin/export — Export CSV
export async function GET(request: NextRequest) {
  const qpw = request.nextUrl.searchParams.get('pw');
  const isAuth = verifyAdmin(request) || qpw === process.env.ADMIN_PASSWORD;
  if (!isAuth) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT t.id, t.name, t.phone, t.position, t.academic_level, t.department, t.created_at,
        GROUP_CONCAT(c.course_id ORDER BY c.course_id) AS submitted_courses,
        COUNT(c.id) AS cert_count
      FROM teachers t
      LEFT JOIN certificates c ON t.id = c.teacher_id
      GROUP BY t.id
      ORDER BY t.department, t.name
    `);

    const courseHeaders = COURSES.map((c) => `"${c.name}"`).join(',');
    const header = `ลำดับ,ชื่อ-นามสกุล,เบอร์โทร,ตำแหน่ง,วิทยฐานะ,กลุ่มสาระ,${courseHeaders},จำนวนที่ส่ง,วันที่ลงทะเบียน\n`;

    const rows2 = rows as RowDataPacket[];
    const csvRows = rows2.map((r, i) => {
      const submitted = r.submitted_courses
        ? (r.submitted_courses as string).split(',').map(Number)
        : [];
      const courseCols = COURSES.map((c) => (submitted.includes(c.id) ? 'ส่งแล้ว' : 'ยังไม่ส่ง')).join(',');
      const date = new Date(r.created_at).toLocaleDateString('th-TH');
      return `${i + 1},"${r.name}","${r.phone ?? ''}","${r.position}","${r.academic_level}","${r.department}",${courseCols},${r.cert_count},"${date}"`;
    });

    const csv = '﻿' + header + csvRows.join('\n'); // BOM for Excel Thai
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="google-ai-cert-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse('Error', { status: 500 });
  }
}
