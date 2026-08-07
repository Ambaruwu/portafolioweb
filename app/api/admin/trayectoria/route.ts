import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/requireAuth'

type TrayectoriaBody = {
  empresa_o_contexto?: unknown
  rol?: unknown
  fecha_inicio?: unknown
  fecha_fin?: unknown
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

async function getNextOrder() {
  const { data, error } = await createAdminClient().from('trayectoria').select('orden').order('orden', { ascending: false }).limit(1).maybeSingle()
  if (error) throw error
  return data ? data.orden + 1 : 0
}

function getFields(body: TrayectoriaBody) {
  return {
    empresa_o_contexto: typeof body.empresa_o_contexto === 'string' ? body.empresa_o_contexto.trim() : '',
    rol: typeof body.rol === 'string' ? body.rol.trim() : '',
    fecha_inicio: typeof body.fecha_inicio === 'string' ? body.fecha_inicio.trim() : '',
    fecha_fin: typeof body.fecha_fin === 'string' && body.fecha_fin.trim() ? body.fecha_fin.trim() : null,
    color_punto: '#0071e3',
  }
}

export async function GET() {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  const { data, error } = await createAdminClient().from('trayectoria').select('*').order('orden', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}

export async function POST(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  try {
    const fields = getFields(await request.json())
    if (!fields.empresa_o_contexto || !fields.rol || !fields.fecha_inicio) return NextResponse.json({ error: 'Empresa, rol y fecha de inicio requeridos' }, { status: 400 })
    const { data, error } = await createAdminClient().from('trayectoria').insert({ ...fields, orden: await getNextOrder() }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  try {
    const body = await request.json() as TrayectoriaBody & { id?: unknown }
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 })
    const fields = getFields(body)
    if (!fields.empresa_o_contexto || !fields.rol || !fields.fecha_inicio) return NextResponse.json({ error: 'Empresa, rol y fecha de inicio requeridos' }, { status: 400 })
    const { data, error } = await createAdminClient().from('trayectoria').update(fields).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 })
  const { error } = await createAdminClient().from('trayectoria').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
