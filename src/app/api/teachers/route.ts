import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { ApiResponse, TeacherSearchResult } from '@/lib/types';
import { POSITIONS, ACADEMIC_LEVELS, DEPARTMENTS } from '@/lib/courses';

// GET /api/teachers?search=ชื่อ
export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')?.trim() ?? '';
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT t.id, t.name, t.department, t.position, t.academic_level,
              (t.phone IS NOT NULL AND t.phone != '') AS is_registered,
              COUNT(c.id) AS cert_count
       FROM teachers t
       LEFT JOIN certificates c ON t.id = c.teacher_id
       WHERE t.name LIKE ?
       GROUP BY t.id
       ORDER BY t.name
       LIMIT 20`,
      [`%${search}%`]
    );
    const data: TeacherSearchResult[] = (rows as RowDataPacket[]).map((r) => ({
      id: r.id,
      name: r.name,
      department: r.department,
      position: r.position,
      academic_level: r.academic_level,
      is_registered: !!r.is_registered,
      cert_count: Number(r.cert_count),
    }));
    return NextResponse.json<ApiResponse<TeacherSearchResult[]>>({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาดในการค้นหา' }, { status: 500 });
  }
}

// POST /api/teachers — ลงทะเบียนครั้งแรก
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, position, academic_level, department } = body as {
      name: string; phone: string; position: string;
      academic_level: string; department: string;
    };

    if (!name?.trim() || !phone?.trim() || !position || !academic_level || !department) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก' }, { status: 400 });
    }
    if (!(POSITIONS as readonly string[]).includes(position)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ตำแหน่งไม่ถูกต้อง' }, { status: 400 });
    }
    if (!(ACADEMIC_LEVELS as readonly string[]).includes(academic_level)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'วิทยฐานะไม่ถูกต้อง' }, { status: 400 });
    }
    if (!(DEPARTMENTS as readonly string[]).includes(department)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'กลุ่มสาระไม่ถูกต้อง' }, { status: 400 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO teachers (name, phone, position, academic_level, department) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), phone, position, academic_level, department]
    );
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM teachers WHERE id = ?', [result.insertId]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: (rows as RowDataPacket[])[0],
      message: 'ลงทะเบียนสำเร็จ',
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาดในการลงทะเบียน' }, { status: 500 });
  }
}
