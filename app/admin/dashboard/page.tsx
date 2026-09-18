'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import TagInput, { TagItem } from '@/components/admin/TagInput'
import TrayectoriaList, { TrayectoriaItem } from '@/components/admin/TrayectoriaList'
import FormacionSobreMiList, { FormacionSobreMiItem } from '@/components/admin/FormacionSobreMiList'
import DestacadosList, { DestacadoItem } from '@/components/admin/DestacadosList'
import ProyectosList, { ProyectoItem, ProyectoMedia, ProyectoTag } from '@/components/admin/ProyectosList'
import CertificacionesList, { CertificacionItem } from '@/components/admin/CertificacionesList'

const fields = [
  ['nombre', 'Nombre'],
  ['titulo', 'Título'],
  ['especialidad', 'Especialidad'],
  ['bio_titulo', 'Título de biografía'],
  ['foto_url', 'URL de foto'],
  ['cv_url', 'URL de CV'],
  ['email', 'Email'],
  ['whatsapp_numero', 'WhatsApp'],
  ['linkedin_url', 'LinkedIn'],
  ['instagram_url', 'Instagram'],
  ['ubicacion_corta', 'Ubicación'],
] as const

type PerfilForm = Record<(typeof fields)[number][0] | 'bio_texto' | 'mensaje_contacto', string>

const emptyForm: PerfilForm = {
  nombre: '', titulo: '', especialidad: '', bio_titulo: '', bio_texto: '',
  foto_url: '', cv_url: '', email: '', whatsapp_numero: '', linkedin_url: '',
  instagram_url: '', ubicacion_corta: '', mensaje_contacto: '',
}

type SkillItem = TagItem & { destacado: boolean }

export default function AdminDashboardPage() {
  const router = useRouter()
  const [form, setForm] = useState<PerfilForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [herramientas, setHerramientas] = useState<TagItem[]>([])
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [trayectoria, setTrayectoria] = useState<TrayectoriaItem[]>([])
  const [formacionSobreMi, setFormacionSobreMi] = useState<FormacionSobreMiItem[]>([])
  const [destacados, setDestacados] = useState<DestacadoItem[]>([])
  const [proyectos, setProyectos] = useState<ProyectoItem[]>([])
  const [certificaciones, setCertificaciones] = useState<CertificacionItem[]>([])
  const [uploadingField, setUploadingField] = useState<'foto_url' | 'cv_url' | null>(null)

  useEffect(() => {
    async function load() {
      const session = await fetch('/api/auth/session')
      const sessionData = await session.json()
      if (!sessionData.authenticated) {
        router.replace('/admin')
        return
      }
      const response = await fetch('/api/admin/perfil')
      if (response.ok) {
        const data = await response.json()
        if (data) setForm({ ...emptyForm, ...data })
      } else if (response.status === 401) {
        router.replace('/admin')
        return
      }
      const [herramientasResponse, skillsResponse, trayectoriaResponse, formacionResponse, destacadosResponse, proyectosResponse, certificacionesResponse] = await Promise.all([
        fetch('/api/admin/herramientas-uso'),
        fetch('/api/admin/skills-resumen'),
        fetch('/api/admin/trayectoria'),
        fetch('/api/admin/formacion-sobre-mi'),
        fetch('/api/admin/destacados'),
        fetch('/api/admin/proyectos'),
        fetch('/api/admin/certificaciones'),
      ])
      if (herramientasResponse.ok) setHerramientas(await herramientasResponse.json())
      if (skillsResponse.ok) setSkills(await skillsResponse.json())
      if (trayectoriaResponse.ok) setTrayectoria(await trayectoriaResponse.json())
      if (formacionResponse.ok) setFormacionSobreMi(await formacionResponse.json())
      if (destacadosResponse.ok) setDestacados(await destacadosResponse.json())
      if (proyectosResponse.ok) setProyectos(await proyectosResponse.json())
      if (certificacionesResponse.ok) setCertificaciones(await certificacionesResponse.json())
      setLoading(false)
    }
    load().catch(() => setError('No se pudo cargar el perfil')).finally(() => setLoading(false))
  }, [router])

  function updateField(name: keyof PerfilForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
    setMessage('')
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true); setMessage(''); setError('')
    try {
      const response = await fetch('/api/admin/perfil', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar el perfil')
      setForm({ ...emptyForm, ...data }); setMessage('Guardado correctamente')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el perfil')
    } finally { setSaving(false) }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/admin')
  }

  async function uploadFile(file: File, field: 'foto_url' | 'cv_url') {
    setUploadingField(field)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('carpeta', 'perfil')
      const response = await fetch('/api/admin/upload', { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo subir el archivo')
      updateField(field, data.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir el archivo')
    } finally {
      setUploadingField(null)
    }
  }

  async function addHerramienta(nombre: string) {
    const response = await fetch('/api/admin/herramientas-uso', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo agregar la herramienta')
    setHerramientas((current) => [...current, data])
  }

  async function removeHerramienta(id: string) {
    const response = await fetch(`/api/admin/herramientas-uso?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo eliminar la herramienta')
    setHerramientas((current) => current.filter((item) => item.id !== id))
  }

  async function addSkill(nombre: string, destacado = false) {
    const response = await fetch('/api/admin/skills-resumen', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, destacado }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo agregar el skill')
    setSkills((current) => [...current, data])
  }

  async function removeSkill(id: string) {
    const response = await fetch(`/api/admin/skills-resumen?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo eliminar el skill')
    setSkills((current) => current.filter((item) => item.id !== id))
  }

  async function addTrayectoria(item: Omit<TrayectoriaItem, 'id' | 'orden' | 'color_punto'>) {
    const response = await fetch('/api/admin/trayectoria', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo agregar la trayectoria')
    setTrayectoria((current) => [...current, data])
  }

  async function updateTrayectoria(id: string, item: Omit<TrayectoriaItem, 'id' | 'orden' | 'color_punto'>) {
    const response = await fetch('/api/admin/trayectoria', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...item }) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo actualizar la trayectoria')
    setTrayectoria((current) => current.map((entry) => entry.id === id ? data : entry))
  }

  async function removeTrayectoria(id: string) {
    const response = await fetch(`/api/admin/trayectoria?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo eliminar la trayectoria')
    setTrayectoria((current) => current.filter((entry) => entry.id !== id))
  }

  async function addFormacionSobreMi(item: Omit<FormacionSobreMiItem, 'id' | 'orden'>) {
    const response = await fetch('/api/admin/formacion-sobre-mi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo agregar la formación')
    setFormacionSobreMi((current) => [...current, data])
  }

  async function updateFormacionSobreMi(id: string, item: Omit<FormacionSobreMiItem, 'id' | 'orden'>) {
    const response = await fetch('/api/admin/formacion-sobre-mi', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...item }) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo actualizar la formación')
    setFormacionSobreMi((current) => current.map((entry) => entry.id === id ? data : entry))
  }

  async function removeFormacionSobreMi(id: string) {
    const response = await fetch(`/api/admin/formacion-sobre-mi?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo eliminar la formación')
    setFormacionSobreMi((current) => current.filter((entry) => entry.id !== id))
  }

  async function addDestacado(item: Omit<DestacadoItem, 'id' | 'orden'>) {
    const response = await fetch('/api/admin/destacados', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo agregar el destacado')
    setDestacados((current) => [...current, data])
  }

  async function updateDestacado(id: string, item: Omit<DestacadoItem, 'id' | 'orden'>) {
    const response = await fetch('/api/admin/destacados', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...item }) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo actualizar el destacado')
    setDestacados((current) => current.map((entry) => entry.id === id ? data : entry))
  }

  async function removeDestacado(id: string) {
    const response = await fetch(`/api/admin/destacados?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo eliminar el destacado')
    setDestacados((current) => current.filter((entry) => entry.id !== id))
  }

  async function addCertificacion(item: Omit<CertificacionItem, 'id' | 'orden'>) {
    const response = await fetch('/api/admin/certificaciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo agregar la certificación')
    setCertificaciones((current) => [...current, data])
  }

  async function updateCertificacion(id: string, item: Omit<CertificacionItem, 'id' | 'orden'>) {
    const response = await fetch('/api/admin/certificaciones', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...item }) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo actualizar la certificación')
    setCertificaciones((current) => current.map((entry) => entry.id === id ? data : entry))
  }

  async function removeCertificacion(id: string) {
    const response = await fetch(`/api/admin/certificaciones?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudo eliminar la certificación')
    setCertificaciones((current) => current.filter((entry) => entry.id !== id))
  }

  async function updateProyecto(id: string, data: Pick<ProyectoItem, 'titulo' | 'categoria' | 'cliente_o_rol' | 'descripcion_corta' | 'link_url'>) {
    const response = await fetch('/api/admin/proyectos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'No se pudo actualizar el proyecto')
    setProyectos((current) => current.map((item) => item.id === id ? { ...item, ...result } : item))
  }

  async function deleteProyecto(id: string) {
    const response = await fetch(`/api/admin/proyectos?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'No se pudo eliminar el proyecto')
    setProyectos((current) => current.filter((item) => item.id !== id))
  }

  function addProyectoTag(id: string, tag: ProyectoTag) { setProyectos((current) => current.map((item) => item.id === id ? { ...item, proyecto_tags: [...item.proyecto_tags, tag] } : item)) }
  async function deleteProyectoTag(id: string, tagId: string) { const response = await fetch(`/api/admin/proyectos/${id}/tags?tagId=${encodeURIComponent(tagId)}`, { method: 'DELETE' }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'No se pudo eliminar el tag'); setProyectos((current) => current.map((item) => item.id === id ? { ...item, proyecto_tags: item.proyecto_tags.filter((tag) => tag.id !== tagId) } : item)) }
  function addProyectoMedia(id: string, media: ProyectoMedia) { setProyectos((current) => current.map((item) => item.id === id ? { ...item, proyecto_media: [...item.proyecto_media, media] } : item)) }
  async function deleteProyectoMedia(id: string, mediaId: string) { const response = await fetch(`/api/admin/proyectos/${id}/media?mediaId=${encodeURIComponent(mediaId)}`, { method: 'DELETE' }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'No se pudo eliminar el archivo'); setProyectos((current) => current.map((item) => item.id === id ? { ...item, proyecto_media: item.proyecto_media.filter((media) => media.id !== mediaId) } : item)) }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Cargando...</main>

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Panel de administración</h1>
          <button onClick={handleLogout} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">Cerrar sesión</button>
        </header>
        <section className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold">Perfil</h2>
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            {fields.map(([name, label]) => {
              if (name === 'foto_url') return <div key={name} className="grid gap-2 text-sm font-medium"><span className="font-medium">{label}</span><div className="flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm">{uploadingField === 'foto_url' && <Loader2 className="h-4 w-4 animate-spin" />}{uploadingField === 'foto_url' ? 'Subiendo...' : form.foto_url ? 'Reemplazar foto' : 'Subir foto'}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploadingField !== null} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadFile(file, 'foto_url') }} /></label>{form.foto_url && <img src={form.foto_url} alt="Vista previa" className="h-12 w-12 rounded-lg object-cover" />}</div></div>
              if (name === 'cv_url') return <div key={name} className="grid gap-2 text-sm font-medium"><span className="font-medium">{label}</span><div className="flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm">{uploadingField === 'cv_url' && <Loader2 className="h-4 w-4 animate-spin" />}{uploadingField === 'cv_url' ? 'Subiendo...' : form.cv_url ? 'Reemplazar CV' : 'Subir CV (PDF)'}<input type="file" accept="application/pdf" className="sr-only" disabled={uploadingField !== null} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadFile(file, 'cv_url') }} /></label>{form.cv_url && <span className="max-w-xs truncate text-sm text-slate-500">{form.cv_url.split('/').pop()}</span>}</div></div>
              return <label key={name} className="grid gap-2 text-sm font-medium">{label}<input value={form[name]} onChange={(e) => updateField(name, e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label>
            })}
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">Texto de biografía<textarea value={form.bio_texto} onChange={(e) => updateField('bio_texto', e.target.value)} rows={5} className="rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label>
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">Mensaje de contacto<textarea value={form.mensaje_contacto} onChange={(e) => updateField('mensaje_contacto', e.target.value)} rows={4} className="rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></label>
             <div className="flex items-center gap-4 sm:col-span-2"><button disabled={saving} className="inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? 'Guardando...' : 'Guardar cambios'}</button>{message && <p className="text-sm text-emerald-600">{message}</p>}{error && <p role="alert" className="text-sm text-red-600">{error}</p>}</div>
          </form>
        </section>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
            <TagInput items={herramientas} onAdd={addHerramienta} onRemove={removeHerramienta} label="Herramientas de uso" reorderUrl="/api/admin/herramientas-uso/reorder" />
          </section>
          <section className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
            <TagInput items={skills} onAdd={addSkill} onRemove={removeSkill} label="Skills resumen" showFeaturedToggle reorderUrl="/api/admin/skills-resumen/reorder" />
          </section>
        </div>
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <TrayectoriaList items={trayectoria} onAdd={addTrayectoria} onUpdate={updateTrayectoria} onDelete={removeTrayectoria} />
        </section>
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <FormacionSobreMiList items={formacionSobreMi} onAdd={addFormacionSobreMi} onUpdate={updateFormacionSobreMi} onDelete={removeFormacionSobreMi} />
        </section>
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <DestacadosList items={destacados} onAdd={addDestacado} onUpdate={updateDestacado} onDelete={removeDestacado} />
        </section>
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <ProyectosList items={proyectos} onAdd={(item) => setProyectos((current) => [...current, item])} onUpdate={updateProyecto} onDelete={deleteProyecto} onTagAdd={addProyectoTag} onTagDelete={deleteProyectoTag} onMediaAdd={addProyectoMedia} onMediaDelete={deleteProyectoMedia} />
        </section>
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <CertificacionesList items={certificaciones} onAdd={addCertificacion} onUpdate={updateCertificacion} onDelete={removeCertificacion} />
        </section>
      </div>
    </main>
  )
}
