import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/requireAuth'

const perfilFields = [
  'nombre',
  'titulo',
  'especialidad',
  'bio_titulo',
  'bio_texto',
  'foto_url',
  'cv_url',
  'email',
  'whatsapp_numero',
  'linkedin_url',
  'instagram_url',
  'ubicacion_corta',
  'mensaje_contacto',
] as const

type PerfilField = (typeof perfilFields)[number]

function unauthorizedResponse() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

function getPerfilData(body: Record<string, unknown>) {
  return perfilFields.reduce<Partial<Record<PerfilField, unknown>>>((data, field) => {
    if (field in body) data[field] = body[field]
    return data
  }, {})
}

function getStoragePath(mediaUrl: string) {
  const marker = '/storage/v1/object/public/portfolio-media/'
  return mediaUrl.includes(marker) ? decodeURIComponent(mediaUrl.split(marker)[1]) : null
}

async function removeReplacedFile(client: ReturnType<typeof createAdminClient>, oldUrl: unknown, newUrl: unknown, field: 'foto_url' | 'cv_url') {
  if (typeof oldUrl !== 'string' || !oldUrl || oldUrl === newUrl) return
  const path = getStoragePath(oldUrl)
  if (!path) return
  console.log(`Eliminando archivo anterior de perfil (${field}) de Storage:`, path)
  const { error } = await client.storage.from('portfolio-media').remove([path])
  if (error) console.error(`No se pudo eliminar el archivo anterior de perfil (${field}):`, error)
}

export async function GET() {
  try {
    await requireAdminAuth()
  } catch {
    return unauthorizedResponse()
  }

  const { data, error } = await createAdminClient()
    .from('perfil')
    .select('*')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}

export async function PUT(request: Request) {
  try {
    await requireAdminAuth()
  } catch {
    return unauthorizedResponse()
  }

  try {
    const body = await request.json()
    const payload = getPerfilData(body)
    const client = createAdminClient()
    const existing = await client.from('perfil').select('id, foto_url, cv_url').maybeSingle()

    if (existing.error) {
      return NextResponse.json({ error: existing.error.message }, { status: 500 })
    }

    const result = existing.data
      ? await client
          .from('perfil')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', existing.data.id)
          .select()
          .single()
      : await client.from('perfil').insert(payload).select().single()

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    if (existing.data) {
      if ('foto_url' in payload) await removeReplacedFile(client, existing.data.foto_url, payload.foto_url, 'foto_url')
      if ('cv_url' in payload) await removeReplacedFile(client, existing.data.cv_url, payload.cv_url, 'cv_url')
    }

    return NextResponse.json(result.data, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
