import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/requireAuth'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

async function getNextOrder() {
  const { data, error } = await createAdminClient()
    .from('skills_resumen')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ? data.orden + 1 : 0
}

export async function GET() {
  try {
    await requireAdminAuth()
  } catch {
    return unauthorizedResponse()
  }

  const { data, error } = await createAdminClient()
    .from('skills_resumen')
    .select('*')
    .order('orden', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}

export async function POST(request: Request) {
  try {
    await requireAdminAuth()
  } catch {
    return unauthorizedResponse()
  }

  try {
    const body = await request.json()
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
    if (!nombre) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

    const orden = await getNextOrder()
    const destacado = body.destacado === true
    const { data, error } = await createAdminClient()
      .from('skills_resumen')
      .insert({ nombre, destacado, orden })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminAuth()
  } catch {
    return unauthorizedResponse()
  }

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 })

  const { error } = await createAdminClient().from('skills_resumen').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
