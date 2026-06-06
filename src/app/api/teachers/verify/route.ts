import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { ApiResponse, Teacher, Certificate } from '@/lib/types';

// POST /api/teachers/verify — ยืนยันเบอร์โทร
export async function POST(request: NextRequest) {
  try {
    const { teacher_id, phone } = await request.json() as { teacher_id: number; phone: string };

    if (!teacher_id || !phone) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'รูปแบบเบอร์โทรไม่ถูกต้อง' }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM teachers WHERE id = ? AND phone = ?',
      [teacher_id, phone]
    );

    if ((rows as RowDataPacket[]).length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'เบอร์โทรไม่ถูกต้อง' }, { status: 401 });
    }

    const teacher = (rows as RowDataPacket[])[0] as Teacher;
    const [certs] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM certificates WHERE teacher_id = ? ORDER BY course_id',
      [teacher_id]
    );

    return NextResponse.json<ApiResponse<{ teacher: Teacher; certificates: Certificate[] }>>({
      success: true,
      data: { teacher, certificates: certs as Certificate[] },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
