import { NextResponse } from 'next/server';
import { signJwt } from '@/lib/auth';
import { timingSafeEqual } from 'crypto';

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Compare against itself to consume constant time, then return false
      timingSafeEqual(bufA, bufA);
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Basic brute-force protection
    await new Promise(r => setTimeout(r, 1000));

    const expectedUser = process.env.ADMIN_USER;
    const expectedPass = process.env.ADMIN_PASSWORD;

    if (!expectedUser || !expectedPass || !process.env.JWT_SECRET) {
      console.error("CRITICAL: Missing authentication secrets in environment.");
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const userMatch = safeCompare(username, expectedUser);
    const passMatch = safeCompare(password, expectedPass);

    if (userMatch && passMatch) {
      const token = await signJwt({ username, role: 'admin' });
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      });
      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}
