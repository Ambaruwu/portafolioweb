import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/requireAuth'

type DestacadoBody = { titulo?: unknown; etiqueta?: unknown; cliente?: unknown; descripcion?: unknown; media_url?: unknown; media_tipo?: unknown; aspect_ratio?: unknown }
function unauthorizedResponse() { return NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }

async function getNextOrder() {
  const { data, error } = await createAdminClient().from('proyectos_destacados').select('orden').order('orden', { ascending: false }).limit(1).maybeSingle()
  if (error) throw error
  return data ? data.orden + 1 : 0
}

function getFields(body: DestacadoBody) { return { titulo: typeof body.titulo === 'string' ? body.titulo.trim() : '', etiqueta: typeof body.etiqueta === 'string' ? body.etiqueta.trim() : '', cliente: typeof body.cliente === 'string' ? body.cliente.trim() : '', descripcion: typeof body.descripcion === 'string' ? body.descripcion.trim() : null, media_url: typeof body.media_url === 'string' ? body.media_url.trim() : '', media_tipo: body.media_tipo === 'video' ? 'video' : 'imagen', aspect_ratio: typeof body.aspect_ratio === 'string' && body.aspect_ratio.trim() ? body.aspect_ratio.trim() : '1' } }
function getStoragePath(mediaUrl: string) { const marker = '/storage/v1/object/public/portfolio-media/'; return mediaUrl.includes(marker) ? decodeURIComponent(mediaUrl.split(marker)[1]) : null }

export async function GET() {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  const { data, error } = await createAdminClient().from('proyectos_destacados').select('*').order('orden', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}

export async function POST(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  try {
    const fields = getFields(await request.json())
    if (!fields.titulo || !fields.etiqueta || !fields.cliente || !fields.media_url) return NextResponse.json({ error: 'Título, etiqueta, cliente y archivo requeridos' }, { status: 400 })
    const { data, error } = await createAdminClient().from('proyectos_destacados').insert({ ...fields, orden: await getNextOrder() }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 200 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 }) }
}

export async function PUT(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  try {
    const body = await request.json() as DestacadoBody & { id?: unknown }
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 })
    const fields = getFields(body)
    if (!fields.titulo || !fields.etiqueta || !fields.cliente || !fields.media_url) return NextResponse.json({ error: 'Título, etiqueta, cliente y archivo requeridos' }, { status: 400 })
    const client = createAdminClient()
    const { data: existing, error: existingError } = await client.from('proyectos_destacados').select('media_url').eq('id', id).maybeSingle()
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 })
    const { data, error } = await client.from('proyectos_destacados').update(fields).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (existing?.media_url && existing.media_url !== fields.media_url) {
      const oldPath = getStoragePath(existing.media_url)
      if (oldPath) {
        console.log('Eliminando archivo anterior de destacado de Storage:', oldPath)
        const { error: storageError } = await client.storage.from('portfolio-media').remove([oldPath])
        if (storageError) console.error('No se pudo eliminar el archivo anterior de destacado:', storageError)
      }
    }
    return NextResponse.json(data, { status: 200 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 }) }
}

export async function DELETE(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 })
  const client = createAdminClient()
  const { data: item } = await client.from('proyectos_destacados').select('media_url').eq('id', id).maybeSingle()
  const path = item?.media_url ? getStoragePath(item.media_url) : null
  if (path) {
    console.log('Eliminando archivo destacado de Storage:', path)
    const { error } = await client.storage.from('portfolio-media').remove([path])
    if (error) console.error('No se pudo eliminar el archivo destacado de Storage:', error)
  }
  const { error } = await client.from('proyectos_destacados').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
