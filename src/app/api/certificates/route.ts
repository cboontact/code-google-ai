import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import pool from '@/lib/db';
import { ApiResponse, Certificate } from '@/lib/types';

const UPLOAD_BASE = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 15 * 1024 * 1024;

// GET /api/certificates?teacher_id=1
export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get('teacher_id');
  if (!teacherId) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'ต้องระบุ teacher_id' }, { status: 400 });
  }
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM certificates WHERE teacher_id = ? ORDER BY course_id',
      [teacherId]
    );
    return NextResponse.json<ApiResponse<Certificate[]>>({ success: true, data: rows as Certificate[] });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// POST /api/certificates — อัพโหลดเกียรติบัตร
export async function POST(request: NextRequest) {
  try {
    const formData  = await request.formData();
    const teacherId = formData.get('teacher_id') as string;
    const courseId  = formData.get('course_id')  as string;
    const phone     = formData.get('phone')       as string;
    const file      = formData.get('file')        as File | null;

    if (!teacherId || !courseId || !phone || !file) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const courseNum = parseInt(courseId);
    if (isNaN(courseNum) || courseNum < 1 || courseNum > 7) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'หลักสูตรไม่ถูกต้อง' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'กรุณาอัพโหลดไฟล์ PDF เท่านั้น' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ไฟล์ขนาดใหญ่เกิน 15MB' }, { status: 400 });
    }

    // ยืนยันเบอร์โทร
    const [teacher] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM teachers WHERE id = ? AND phone = ?', [teacherId, phone]
    );
    if ((teacher as RowDataPacket[]).length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'เบอร์โทรไม่ถูกต้อง' }, { status: 401 });
    }

    // สร้างโฟลเดอร์แยกตาม teacher: public/uploads/{teacherId}/
    const teacherDir = path.join(UPLOAD_BASE, teacherId);
    await mkdir(teacherDir, { recursive: true });

    // ลบไฟล์เก่าถ้ามี
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT file_path FROM certificates WHERE teacher_id = ? AND course_id = ?',
      [teacherId, courseNum]
    );
    if ((existing as RowDataPacket[]).length > 0) {
      const oldPath = path.join(process.cwd(), 'public', (existing as RowDataPacket[])[0].file_path);
      await unlink(oldPath).catch(() => null);
    }

    // ชื่อไฟล์: course_{courseId}.pdf — ชัดเจน อ่านง่าย
    const filename = `course_${courseNum}.pdf`;
    const filePath = path.join(teacherDir, filename);
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    // path ที่เก็บใน DB: /uploads/{teacherId}/course_{courseId}.pdf
    const dbPath = `/uploads/${teacherId}/course_${courseNum}.pdf`;

    if ((existing as RowDataPacket[]).length > 0) {
      await pool.execute(
        'UPDATE certificates SET file_path=?, file_name=?, file_size=?, updated_at=NOW() WHERE teacher_id=? AND course_id=?',
        [dbPath, file.name, file.size, teacherId, courseNum]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        'INSERT INTO certificates (teacher_id, course_id, file_path, file_name, file_size) VALUES (?, ?, ?, ?, ?)',
        [teacherId, courseNum, dbPath, file.name, file.size]
      );
    }

    const [updated] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM certificates WHERE teacher_id = ? AND course_id = ?', [teacherId, courseNum]
    );
    return NextResponse.json<ApiResponse<Certificate>>({
      success: true,
      data: (updated as RowDataPacket[])[0] as Certificate,
      message: 'อัพโหลดสำเร็จ',
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาดในการอัพโหลด' }, { status: 500 });
  }
}
