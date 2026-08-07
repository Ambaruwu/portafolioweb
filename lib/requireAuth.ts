import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/auth'

export async function requireAdminAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value

  if (!token || !(await verifySessionToken(token))) {
    throw new Error('No autorizado')
  }
}
