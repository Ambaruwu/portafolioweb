import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Row = Record<string, unknown>

type PortfolioResponse = {
  perfil: Row | null
  herramientasUso: Row[]
  trayectoria: Row[]
  skillsResumen: Row[]
  formacionSobreMi: Row[]
  proyectosDestacados: Row[]
  proyectos: Row[]
  skillCategorias: Row[]
  formacionAcademica: Row[]
  idiomas: Row[]
  certificaciones: Row[]
}

type QueryResult<T> = {
  data: T | null
  error: Error | null
}

function normalizeArrayResult<T>(
  tableName: string,
  result: QueryResult<T[]>,
  fallback: T[] = []
): T[] {
  if (result.error) {
    console.error(`Error consultando la tabla ${tableName}:`, result.error)
    return fallback
  }

  return result.data ?? fallback
}

function normalizeSingleResult<T>(
  tableName: string,
  result: QueryResult<T[]>,
  fallback: T | null = null
): T | null {
  if (result.error) {
    console.error(`Error consultando la tabla ${tableName}:`, result.error)
    return fallback
  }

  return result.data?.[0] ?? fallback
}

export async function GET() {
  try {
    const supabase = await createClient()

    const [
      perfilResult,
      herramientasUsoResult,
      trayectoriaResult,
      skillsResumenResult,
      formacionSobreMiResult,
      proyectosDestacadosResult,
      proyectosResult,
      skillCategoriasResult,
      formacionAcademicaResult,
      idiomasResult,
      certificacionesResult,
    ] = await Promise.all([
      supabase.from('perfil').select('*').limit(1),
      supabase.from('herramientas_uso').select('*').order('orden', { ascending: true }),
      supabase.from('trayectoria').select('*').order('orden', { ascending: true }),
      supabase.from('skills_resumen').select('*').order('orden', { ascending: true }),
      supabase.from('formacion_sobre_mi').select('*').order('orden', { ascending: true }),
      supabase.from('proyectos_destacados').select('*').order('orden', { ascending: true }),
      supabase
        .from('proyectos')
        .select('*, proyecto_tags(*), proyecto_media(*)')
        .order('orden', { ascending: true })
        .order('orden', { referencedTable: 'proyecto_tags', ascending: true })
        .order('orden', { referencedTable: 'proyecto_media', ascending: true }),
      supabase
        .from('skill_categorias')
        .select('*, skills(*)')
        .order('orden', { ascending: true })
        .order('orden', { referencedTable: 'skills', ascending: true }),
      supabase.from('formacion_academica').select('*').order('orden', { ascending: true }),
      supabase.from('idiomas').select('*').order('orden', { ascending: true }),
      supabase.from('certificaciones').select('*').order('orden', { ascending: true }),
    ])

    const resultados = [
      perfilResult.error,
      herramientasUsoResult.error,
      trayectoriaResult.error,
      skillsResumenResult.error,
      formacionSobreMiResult.error,
      proyectosDestacadosResult.error,
      proyectosResult.error,
      skillCategoriasResult.error,
      formacionAcademicaResult.error,
      idiomasResult.error,
      certificacionesResult.error,
    ]

    const totalErrores = resultados.filter(Boolean).length
    if (totalErrores === resultados.length) {
      console.error('No se pudo conectar con Supabase:', resultados[0])
      return NextResponse.json(
        { error: 'No se pudo conectar con la base de datos' },
        { status: 500 }
      )
    }

    const response: PortfolioResponse = {
      perfil: normalizeSingleResult('perfil', perfilResult),
      herramientasUso: normalizeArrayResult('herramientas_uso', herramientasUsoResult),
      trayectoria: normalizeArrayResult('trayectoria', trayectoriaResult),
      skillsResumen: normalizeArrayResult('skills_resumen', skillsResumenResult),
      formacionSobreMi: normalizeArrayResult('formacion_sobre_mi', formacionSobreMiResult),
      proyectosDestacados: normalizeArrayResult(
        'proyectos_destacados',
        proyectosDestacadosResult
      ),
      proyectos: normalizeArrayResult('proyectos', proyectosResult),
      skillCategorias: normalizeArrayResult('skill_categorias', skillCategoriasResult),
      formacionAcademica: normalizeArrayResult(
        'formacion_academica',
        formacionAcademicaResult
      ),
      idiomas: normalizeArrayResult('idiomas', idiomasResult),
      certificaciones: normalizeArrayResult('certificaciones', certificacionesResult),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    const detailedError =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
          }
        : error

    console.error('ERROR DETALLADO:', detailedError)
    console.error('No se pudo conectar con Supabase:', detailedError)
    return NextResponse.json(
      { error: 'No se pudo conectar con la base de datos' },
      { status: 500 }
    )
  }
}
