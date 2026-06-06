import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { unlink } from 'fs/promises';
import path from 'path';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/lib/types';
import { POSITIONS, ACADEMIC_LEVELS, DEPARTMENTS } from '@/lib/courses';

// PUT /api/admin/teachers/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const { name, phone, position, academic_level, department } = await request.json();
    if (!name?.trim() || !department) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'กรุณากรอกชื่อและกลุ่มสาระ' }, { status: 400 });
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก' }, { status: 400 });
    }
    if (position && !(POSITIONS as readonly string[]).includes(position)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ตำแหน่งไม่ถูกต้อง' }, { status: 400 });
    }
    if (academic_level && !(ACADEMIC_LEVELS as readonly string[]).includes(academic_level)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'วิทยฐานะไม่ถูกต้อง' }, { status: 400 });
    }
    if (!(DEPARTMENTS as readonly string[]).includes(department)) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'กลุ่มสาระไม่ถูกต้อง' }, { status: 400 });
    }

    await pool.execute(
      'UPDATE teachers SET name=?, phone=?, position=?, academic_level=?, department=?, updated_at=NOW() WHERE id=?',
      [name.trim(), phone || null, position || 'ครู', academic_level || 'ไม่มีวิทยฐานะ', department, id]
    );
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM teachers WHERE id = ?', [id]);
    return NextResponse.json<ApiResponse>({ success: true, data: (rows as RowDataPacket[])[0], message: 'อัปเดตสำเร็จ' });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// DELETE /api/admin/teachers/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    // ลบไฟล์ PDF ทั้งหมดของครูคนนี้ก่อน
    const [certs] = await pool.execute<RowDataPacket[]>('SELECT file_path FROM certificates WHERE teacher_id = ?', [id]);
    for (const cert of certs as RowDataPacket[]) {
      const filePath = path.join(process.cwd(), 'public', cert.file_path);
      await unlink(filePath).catch(() => null);
    }
    await pool.execute('DELETE FROM teachers WHERE id = ?', [id]);
    return NextResponse.json<ApiResponse>({ success: true, message: 'ลบครูสำเร็จ' });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
