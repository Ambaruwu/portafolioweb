import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/requireAuth'

type ProyectoBody = { titulo?: unknown; categoria?: unknown; cliente_o_rol?: unknown; descripcion_corta?: unknown; link_url?: unknown }
function unauthorizedResponse() { return NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
function getFields(body: ProyectoBody) { return { titulo: typeof body.titulo === 'string' ? body.titulo.trim() : '', categoria: body.categoria === 'independiente' ? 'independiente' : 'empresa', cliente_o_rol: typeof body.cliente_o_rol === 'string' ? body.cliente_o_rol.trim() : '', descripcion_corta: typeof body.descripcion_corta === 'string' ? body.descripcion_corta.trim() : '', link_url: typeof body.link_url === 'string' && body.link_url.trim() ? body.link_url.trim() : null } }
async function getNextOrder() { const { data, error } = await createAdminClient().from('proyectos').select('orden').order('orden', { ascending: false }).limit(1).maybeSingle(); if (error) throw error; return data ? data.orden + 1 : 0 }
function sortRelations(project: Record<string, unknown>) { return { ...project, proyecto_tags: Array.isArray(project.proyecto_tags) ? project.proyecto_tags.sort((a: { orden: number }, b: { orden: number }) => a.orden - b.orden) : [], proyecto_media: Array.isArray(project.proyecto_media) ? project.proyecto_media.sort((a: { orden: number }, b: { orden: number }) => a.orden - b.orden) : [] } }

export async function GET() {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  const { data, error } = await createAdminClient().from('proyectos').select('*, proyecto_tags(*), proyecto_media(*)').order('orden', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map((project) => sortRelations(project)), { status: 200 })
}

export async function POST(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  try { const fields = getFields(await request.json()); if (!fields.titulo || !fields.cliente_o_rol || !fields.descripcion_corta) return NextResponse.json({ error: 'Título, cliente o rol y descripción requeridos' }, { status: 400 }); const { data, error } = await createAdminClient().from('proyectos').insert({ ...fields, orden: await getNextOrder() }).select().single(); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); return NextResponse.json({ ...data, proyecto_tags: [], proyecto_media: [] }, { status: 200 }) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 }) }
}

export async function PUT(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  try { const body = await request.json() as ProyectoBody & { id?: unknown }; const id = typeof body.id === 'string' ? body.id : ''; if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 }); const fields = getFields(body); if (!fields.titulo || !fields.cliente_o_rol || !fields.descripcion_corta) return NextResponse.json({ error: 'Título, cliente o rol y descripción requeridos' }, { status: 400 }); const { data, error } = await createAdminClient().from('proyectos').update(fields).eq('id', id).select().single(); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); return NextResponse.json(data, { status: 200 }) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 }) }
}

export async function DELETE(request: Request) {
  try { await requireAdminAuth() } catch { return unauthorizedResponse() }
  const id = new URL(request.url).searchParams.get('id'); if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 }); const client = createAdminClient(); const { data: media } = await client.from('proyecto_media').select('url, thumbnail_url').eq('proyecto_id', id)
  for (const file of media ?? []) { for (const url of [file.url, file.thumbnail_url]) { if (typeof url === 'string' && url) { const marker = '/storage/v1/object/public/portfolio-media/'; const path = url.includes(marker) ? decodeURIComponent(url.split(marker)[1]) : null; if (path) { console.log('Eliminando archivo de proyecto de Storage:', path); const { error } = await client.storage.from('portfolio-media').remove([path]); if (error) console.error('No se pudo eliminar el archivo de proyecto:', error) } } } }
  const { error } = await client.from('proyectos').delete().eq('id', id); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); return NextResponse.json({ success: true }, { status: 200 })
}
