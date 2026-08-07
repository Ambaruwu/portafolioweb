import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/requireAuth'

type FormacionBody = { institucion?: unknown; programa?: unknown; visible_por_defecto?: unknown }

function unauthorizedResponse() { return NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }

async function getNextOrder() {
  const { data, error } = await createAdminClient().from('formacion_sobre_mi').select('orden').order('orden', { ascending: false }).limit(1).maybeSingle()
  if (error) throw error
  return data ? data.orden + 1 : 0
}

function getFields(body: FormacionBody) {
  return { institucion: typeof body.institucion === 'string' ? body.institucion.trim() : '', programa: typeof body.programa === 'string' ? body.programa.trim() : '', visible_por_defecto: body.visible_por_defecto !== false }
}

export async function GET() {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  const { data, error } = await createAdminClient().from('formacion_sobre_mi').select('*').order('orden', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}

export async function POST(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  try {
    const fields = getFields(await request.json())
    if (!fields.institucion || !fields.programa) return NextResponse.json({ error: 'Institución y programa requeridos' }, { status: 400 })
    const { data, error } = await createAdminClient().from('formacion_sobre_mi').insert({ ...fields, orden: await getNextOrder() }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 200 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 }) }
}

export async function PUT(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  try {
    const body = await request.json() as FormacionBody & { id?: unknown }
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 })
    const fields = getFields(body)
    if (!fields.institucion || !fields.programa) return NextResponse.json({ error: 'Institución y programa requeridos' }, { status: 400 })
    const { data, error } = await createAdminClient().from('formacion_sobre_mi').update(fields).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 200 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 }) }
}

export async function DELETE(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 })
  const { error } = await createAdminClient().from('formacion_sobre_mi').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
