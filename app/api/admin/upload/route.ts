import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/requireAuth'

const fileTypes = {
  'image/jpeg': { extension: 'jpg', tipo: 'imagen', maxSize: 5 * 1024 * 1024 },
  'image/png': { extension: 'png', tipo: 'imagen', maxSize: 5 * 1024 * 1024 },
  'image/webp': { extension: 'webp', tipo: 'imagen', maxSize: 5 * 1024 * 1024 },
  'video/mp4': { extension: 'mp4', tipo: 'video', maxSize: 25 * 1024 * 1024 },
  'application/pdf': { extension: 'pdf', tipo: 'pdf', maxSize: 10 * 1024 * 1024 },
} as const

function unauthorizedResponse() { return NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }

export async function POST(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const carpeta = formData.get('carpeta')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Debes proporcionar un archivo' }, { status: 400 })
    if (typeof carpeta !== 'string' || !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(carpeta)) return NextResponse.json({ error: 'La carpeta no es válida' }, { status: 400 })
    const fileType = fileTypes[file.type as keyof typeof fileTypes]
    if (!fileType) return NextResponse.json({ error: 'Tipo no permitido. Se esperan JPG, PNG, WebP, MP4 o PDF' }, { status: 400 })
    if (file.size > fileType.maxSize) return NextResponse.json({ error: `El archivo excede el límite permitido para ${fileType.tipo}` }, { status: 400 })

    const path = `${carpeta}/${crypto.randomUUID()}.${fileType.extension}`
    const client = createAdminClient()
    const { error } = await client.storage.from('portfolio-media').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const { data } = client.storage.from('portfolio-media').getPublicUrl(path)
    const thumbnail = formData.get('thumbnail')
    if (carpeta === 'certificaciones' && file.type === 'application/pdf' && thumbnail instanceof File) {
      if (thumbnail.type !== 'image/jpeg' || thumbnail.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'La miniatura del PDF no es válida' }, { status: 400 })
      const thumbnailPath = `certificaciones/thumbnails/${crypto.randomUUID()}.jpg`
      const { error: thumbnailError } = await client.storage.from('portfolio-media').upload(thumbnailPath, Buffer.from(await thumbnail.arrayBuffer()), { contentType: 'image/jpeg', upsert: false })
      if (thumbnailError) return NextResponse.json({ error: thumbnailError.message }, { status: 500 })
      const { data: thumbnailData } = client.storage.from('portfolio-media').getPublicUrl(thumbnailPath)
      return NextResponse.json({ url: data.publicUrl, thumbnail_url: thumbnailData.publicUrl, tipo: fileType.tipo }, { status: 200 })
    }
    return NextResponse.json({ url: data.publicUrl, tipo: fileType.tipo }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
