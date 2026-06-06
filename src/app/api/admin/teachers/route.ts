import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/lib/types';
import { POSITIONS, ACADEMIC_LEVELS, DEPARTMENTS } from '@/lib/courses';

// GET /api/admin/teachers — ดึงครูทั้งหมดพร้อมสถานะ
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT t.*,
        COUNT(c.id) AS cert_count,
        GROUP_CONCAT(c.course_id ORDER BY c.course_id) AS submitted_courses
      FROM teachers t
      LEFT JOIN certificates c ON t.id = c.teacher_id
      GROUP BY t.id
      ORDER BY t.department, t.name
    `);
    return NextResponse.json<ApiResponse>({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// POST /api/admin/teachers — เพิ่มครู (admin เพิ่มล่วงหน้า ยังไม่มีเบอร์)
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { name, phone, position, academic_level, department } = await request.json();
    // Admin เพิ่มครู: บังคับแค่ชื่อ — ข้อมูลอื่นใส่ทีหลังได้
    if (!name?.trim()) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'กรุณากรอกชื่อ-นามสกุล' }, { status: 400 });
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก' }, { status: 400 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO teachers (name, phone, position, academic_level, department) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), phone || null, position || 'ครู', academic_level || 'ไม่มีวิทยฐานะ', department || 'ยังไม่ระบุ']
    );
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM teachers WHERE id = ?', [result.insertId]);
    return NextResponse.json<ApiResponse>({ success: true, data: (rows as RowDataPacket[])[0], message: 'เพิ่มครูสำเร็จ' }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
