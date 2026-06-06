import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { ApiResponse, Teacher, Certificate } from '@/lib/types';
import { POSITIONS, ACADEMIC_LEVELS, DEPARTMENTS } from '@/lib/courses';

// GET /api/teachers/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, department, position, academic_level, created_at, updated_at FROM teachers WHERE id = ?',
      [id]
    );
    if ((rows as RowDataPacket[]).length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ไม่พบข้อมูล' }, { status: 404 });
    }
    const teacher = (rows as RowDataPacket[])[0] as Omit<Teacher, 'phone'>;
    const [certs] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM certificates WHERE teacher_id = ? ORDER BY course_id', [id]
    );
    return NextResponse.json<ApiResponse<{ teacher: typeof teacher; certificates: Certificate[] }>>({
      success: true,
      data: { teacher, certificates: certs as Certificate[] },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// PUT /api/teachers/[id] — ครูที่ถูก pre-add กรอกข้อมูลครั้งแรก
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { phone, position, academic_level, department } = await request.json() as {
      phone: string; position: string; academic_level: string; department: string;
    };

    if (!phone || !position || !academic_level || !department) {
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

    // ตรวจว่า teacher มีอยู่จริงและยังไม่มีเบอร์
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id, phone FROM teachers WHERE id = ?', [id]
    );
    if ((existing as RowDataPacket[]).length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ไม่พบข้อมูล' }, { status: 404 });
    }
    if ((existing as RowDataPacket[])[0].phone) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ลงทะเบียนไปแล้ว กรุณาใช้เบอร์โทรเพื่อยืนยัน' }, { status: 409 });
    }

    await pool.execute(
      'UPDATE teachers SET phone=?, position=?, academic_level=?, department=?, updated_at=NOW() WHERE id=?',
      [phone, position, academic_level, department, id]
    );

    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM teachers WHERE id = ?', [id]);
    const [certs] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM certificates WHERE teacher_id = ? ORDER BY course_id', [id]
    );

    return NextResponse.json<ApiResponse<{ teacher: Teacher; certificates: Certificate[] }>>({
      success: true,
      data: { teacher: (rows as RowDataPacket[])[0] as Teacher, certificates: certs as Certificate[] },
      message: 'ลงทะเบียนสำเร็จ',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
