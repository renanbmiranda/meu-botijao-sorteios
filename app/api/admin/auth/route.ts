import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getAdminSessionFromRequest,
  isValidAdminSession,
  SESSION_DURATION_SECONDS,
  validateAdminCredentials,
} from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password || !validateAdminCredentials(username, password)) {
      return NextResponse.json({ error: 'Usuário ou senha inválidos.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(username), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_SECONDS,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isValidAdminSession(getAdminSessionFromRequest(request))) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { maxAge: 0, path: '/' });
  return response;
}