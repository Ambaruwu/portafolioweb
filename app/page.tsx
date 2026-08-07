import { createClient } from '@/lib/supabase/server'
import PortfolioPage from '@/components/public/PortfolioPage'
import type { PortfolioData } from '@/components/public/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const [perfil, herramientasUso, trayectoria, skillsResumen, formacionSobreMi, proyectosDestacados, proyectos, skillCategorias, formacionAcademica, idiomas, certificaciones] = await Promise.all([
    supabase.from('perfil').select('*').limit(1),
    supabase.from('herramientas_uso').select('*').order('orden'),
    supabase.from('trayectoria').select('*').order('orden'),
    supabase.from('skills_resumen').select('*').order('orden'),
    supabase.from('formacion_sobre_mi').select('*').order('orden'),
    supabase.from('proyectos_destacados').select('*').order('orden'),
    supabase.from('proyectos').select('*, proyecto_tags(*), proyecto_media(*)').order('orden'),
    supabase.from('skill_categorias').select('*, skills(*)').order('orden'),
    supabase.from('formacion_academica').select('*').order('orden'),
    supabase.from('idiomas').select('*').order('orden'),
    supabase.from('certificaciones').select('*').order('orden'),
  ])
  const data: PortfolioData = { perfil: perfil.data?.[0] ?? null, herramientasUso: herramientasUso.data ?? [], trayectoria: trayectoria.data ?? [], skillsResumen: skillsResumen.data ?? [], formacionSobreMi: formacionSobreMi.data ?? [], proyectosDestacados: proyectosDestacados.data ?? [], proyectos: (proyectos.data ?? []).map((item) => ({ ...item, proyecto_tags: item.proyecto_tags ?? [], proyecto_media: item.proyecto_media ?? [] })), skillCategorias: skillCategorias.data ?? [], formacionAcademica: formacionAcademica.data ?? [], idiomas: idiomas.data ?? [], certificaciones: certificaciones.data ?? [] }
  return <PortfolioPage data={data} />
}
