import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/requireAuth'

function unauthorizedResponse() { return NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }

export async function PUT(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  try {
    const body = await request.json()
    if (!Array.isArray(body.ids) || body.ids.some((id: unknown) => typeof id !== 'string')) return NextResponse.json({ error: 'ids debe ser un array de strings' }, { status: 400 })
    const client = createAdminClient()
    const results = await Promise.all(body.ids.map((id: string, orden: number) => client.from('skills_resumen').update({ orden }).eq('id', id)))
    const failed = results.find((result) => result.error)
    if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 }) }
}
