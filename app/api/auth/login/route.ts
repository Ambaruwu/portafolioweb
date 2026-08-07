import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_SESSION_MAX_AGE, createSessionToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string }
    const password = body.password?.trim()

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password requerido' },
        { status: 400 }
      )
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    const token = await createSessionToken()
    const cookieStore = await cookies()

    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: '/',
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Password requerido' },
      { status: 400 }
    )
  }
}
