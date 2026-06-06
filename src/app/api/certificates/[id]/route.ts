import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { readFile, unlink } from 'fs/promises';
import path from 'path';
import pool from '@/lib/db';
import { ApiResponse } from '@/lib/types';

const UPLOAD_BASE = path.join(process.cwd(), 'public', 'uploads');

function resolveUploadPath(filePath: string) {
  const relativePath = filePath.replace(/^\/+uploads\/?/, '');
  const resolved = path.resolve(UPLOAD_BASE, relativePath);
  if (!resolved.startsWith(UPLOAD_BASE + path.sep)) {
    throw new Error('Invalid file path');
  }
  return resolved;
}

// GET /api/certificates/[id] — เปิดไฟล์ PDF
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT file_path, file_name FROM certificates WHERE id = ?',
      [id]
    );
    if ((rows as RowDataPacket[]).length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ไม่พบเกียรติบัตร' }, { status: 404 });
    }

    const cert = (rows as RowDataPacket[])[0];
    const buffer = await readFile(resolveUploadPath(cert.file_path));
    const filename = encodeURIComponent(cert.file_name || `certificate-${id}.pdf`);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename*=UTF-8''${filename}`,
        'Cache-Control': 'private, max-age=0',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'ไม่พบไฟล์เกียรติบัตร' }, { status: 404 });
  }
}

// DELETE /api/certificates/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { phone, teacher_id } = await request.json() as { phone: string; teacher_id: number };

    if (!phone || !teacher_id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const [teacher] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM teachers WHERE id = ? AND phone = ?', [teacher_id, phone]
    );
    if ((teacher as RowDataPacket[]).length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'เบอร์โทรไม่ถูกต้อง' }, { status: 401 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM certificates WHERE id = ? AND teacher_id = ?', [id, teacher_id]
    );
    if ((rows as RowDataPacket[]).length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'ไม่พบเกียรติบัตร' }, { status: 404 });
    }

    const filePath = resolveUploadPath((rows as RowDataPacket[])[0].file_path);
    await unlink(filePath).catch(() => null);
    await pool.execute('DELETE FROM certificates WHERE id = ?', [id]);

    return NextResponse.json<ApiResponse>({ success: true, message: 'ลบเกียรติบัตรสำเร็จ' });
  } catch (err) {
    console.error(err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
