import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { ApiResponse, DashboardStats } from '@/lib/types';

// GET /api/dashboard — สถิติภาพรวม
export async function GET() {
  try {
    const [[totalTeachersRow], [totalCertsRow], [completedRow], byCourse, byDept, recent] =
      await Promise.all([
        pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS total FROM teachers'),
        pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS total FROM certificates'),
        pool.execute<RowDataPacket[]>(`
          SELECT COUNT(*) AS total FROM (
            SELECT teacher_id FROM certificates
            GROUP BY teacher_id HAVING COUNT(DISTINCT course_id) = 7
          ) AS completed
        `),
        pool.execute<RowDataPacket[]>(
          'SELECT course_id, COUNT(*) AS count FROM certificates GROUP BY course_id ORDER BY course_id'
        ),
        pool.execute<RowDataPacket[]>(`
          SELECT
            t.department,
            COUNT(DISTINCT t.id) AS teacher_count,
            COALESCE(SUM(cc.cnt), 0) AS cert_count,
            ROUND(COALESCE(SUM(cc.cnt), 0) / (COUNT(DISTINCT t.id) * 7) * 100, 1) AS completion_rate
          FROM teachers t
          LEFT JOIN (
            SELECT teacher_id, COUNT(*) AS cnt FROM certificates GROUP BY teacher_id
          ) cc ON t.id = cc.teacher_id
          GROUP BY t.department
          ORDER BY completion_rate DESC, t.department
        `),
        pool.execute<RowDataPacket[]>(`
          SELECT c.course_id, c.submitted_at, t.name AS teacher_name, t.department
          FROM certificates c
          JOIN teachers t ON c.teacher_id = t.id
          ORDER BY c.submitted_at DESC
          LIMIT 10
        `),
      ]);

    const totalTeachers = Number((totalTeachersRow as RowDataPacket[])[0]?.total ?? 0);
    const totalCerts = Number((totalCertsRow as RowDataPacket[])[0]?.total ?? 0);
    const completedAll = Number((completedRow as RowDataPacket[])[0]?.total ?? 0);
    const possible = totalTeachers * 7;
    const completionRate = possible > 0 ? Math.round((totalCerts / possible) * 100) : 0;

    const data: DashboardStats = {
      total_teachers: totalTeachers,
      total_certificates: totalCerts,
      completed_all: completedAll,
      completion_rate: completionRate,
      by_course: (byCourse[0] as RowDataPacket[]).map((r) => ({
        course_id: r.course_id,
        count: Number(r.count),
      })),
      by_department: (byDept[0] as RowDataPacket[]).map((r) => ({
        department: r.department,
        teacher_count: Number(r.teacher_count),
        cert_count: Number(r.cert_count),
        completion_rate: Number(r.completion_rate),
      })),
      recent: (recent[0] as RowDataPacket[]).map((r) => ({
        teacher_name: r.teacher_name,
        department: r.department,
        course_id: r.course_id,
        submitted_at: r.submitted_at,
      })),
    };

    return NextResponse.json<ApiResponse<DashboardStats>>({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}
