import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }

  const authenticated = await verifySessionToken(token)

  return NextResponse.json({ authenticated }, { status: 200 })
}
