import { NextRequest } from 'next/server';

export function verifyAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('x-admin-password');
  return auth === process.env.ADMIN_PASSWORD;
}

export function verifyAdminPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}
