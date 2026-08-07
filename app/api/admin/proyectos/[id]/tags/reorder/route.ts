import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/requireAuth'

type Context = { params: Promise<{ id: string }> }

function unauthorizedResponse() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requireAdminAuth()
  } catch {
    return unauthorizedResponse()
  }

  try {
    const body = await request.json()
    if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.some((id: unknown) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'ids debe ser un array no vacío de strings' }, { status: 400 })
    }

    const { id: proyectoId } = await params
    const ids = body.ids as string[]
    if (new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: 'ids no puede contener duplicados' }, { status: 400 })
    }

    const client = createAdminClient()
    const { data: tags, error: readError } = await client
      .from('proyecto_tags')
      .select('id')
      .eq('proyecto_id', proyectoId)
      .in('id', ids)

    if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })
    if (!tags || tags.length !== ids.length) {
      return NextResponse.json({ error: 'Todos los tags deben pertenecer al proyecto' }, { status: 400 })
    }

    const results = await Promise.all(ids.map((tagId, orden) =>
      client.from('proyecto_tags').update({ orden }).eq('id', tagId).eq('proyecto_id', proyectoId),
    ))
    const failed = results.find((result) => result.error)
    if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
