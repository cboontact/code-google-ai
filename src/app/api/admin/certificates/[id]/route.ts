import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { unlink } from 'fs/promises';
import path from 'path';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/lib/types';

// DELETE /api/admin/certificates/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT file_path FROM certificates WHERE id = ?', [id]);
    if ((rows as RowDataPacket[]).length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ไม่พบเกียรติบัตร' }, { status: 404 });
    }
    const filePath = path.join(process.cwd(), 'public', (rows as RowDataPacket[])[0].file_path);
    await unlink(filePath).catch(() => null);
    await pool.execute('DELETE FROM certificates WHERE id = ?', [id]);
    return NextResponse.json<ApiResponse>({ success: true, message: 'ลบเกียรติบัตรสำเร็จ' });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
