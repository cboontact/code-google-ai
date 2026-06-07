import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { ApiResponse, DashboardCourseSubmission } from '@/lib/types';

// GET /api/dashboard/courses/[id] — รายชื่อผู้ส่งเกียรติบัตรในหลักสูตรนั้น
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const courseId = Number(id);

  if (!Number.isInteger(courseId) || courseId < 1 || courseId > 7) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'หลักสูตรไม่ถูกต้อง' },
      { status: 400 }
    );
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        c.id,
        c.teacher_id,
        c.course_id,
        c.file_name,
        c.file_size,
        c.submitted_at,
        c.updated_at,
        t.name AS teacher_name,
        t.department,
        t.position,
        t.academic_level
      FROM certificates c
      JOIN teachers t ON t.id = c.teacher_id
      WHERE c.course_id = ?
      ORDER BY t.department ASC, t.name ASC
    `, [courseId]);

    return NextResponse.json<ApiResponse<DashboardCourseSubmission[]>>({
      success: true,
      data: rows as DashboardCourseSubmission[],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงรายชื่อผู้ส่ง' },
      { status: 500 }
    );
  }
}
