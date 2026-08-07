'use client'

import { useEffect, useRef, useState } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { getImageAspectRatio } from '@/lib/imageAspectRatio'
import { generatePdfThumbnail } from '@/lib/pdfThumbnail'
import ConfirmDialog from './ConfirmDialog'
import SortableItem from './SortableItem'
import { useReorderableItems } from './useReorderableItems'

export type CertificacionItem = {
  id: string
  titulo: string
  institucion: string
  fecha: string
  descripcion: string
  imagen_url: string
  aspect_ratio: string
  orden: number
}

type Payload = Omit<CertificacionItem, 'id' | 'orden'>
type Props = {
  items: CertificacionItem[]
  onAdd: (item: Payload) => Promise<void>
  onUpdate: (id: string, item: Payload) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const emptyForm: Payload = { titulo: '', institucion: '', fecha: '', descripcion: '', imagen_url: '', aspect_ratio: '1' }

export default function CertificacionesList({ items, onAdd, onUpdate, onDelete }: Props) {
  const { orderedItems, sensors, handleDragEnd, reorderError } = useReorderableItems(items, '/api/admin/certificaciones/reorder')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Payload>(emptyForm)
  const [addForm, setAddForm] = useState<Payload>(emptyForm)
  const [pendingDelete, setPendingDelete] = useState<CertificacionItem | null>(null)
  const [uploadingAction, setUploadingAction] = useState<'add' | 'edit' | null>(null)
  const [busyAction, setBusyAction] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [error, setError] = useState('')
  const [previewUrls, setPreviewUrls] = useState<{ add?: string; edit?: string }>({})
  const previewUrlsRef = useRef<{ add?: string; edit?: string }>({})

  useEffect(() => {
    console.log('Certificaciones recibidas:', items)
  }, [items])

  useEffect(() => () => {
    Object.values(previewUrlsRef.current).forEach((url) => { if (url) URL.revokeObjectURL(url) })
  }, [])

  function setLocalPreview(action: 'add' | 'edit', file: File) {
    const previous = previewUrlsRef.current[action]
    if (previous) URL.revokeObjectURL(previous)
    const next = URL.createObjectURL(file)
    previewUrlsRef.current = { ...previewUrlsRef.current, [action]: next }
    setPreviewUrls((current) => ({ ...current, [action]: next }))
  }

  function clearLocalPreview(action: 'add' | 'edit') {
    const previous = previewUrlsRef.current[action]
    if (previous) URL.revokeObjectURL(previous)
    previewUrlsRef.current = { ...previewUrlsRef.current, [action]: undefined }
    setPreviewUrls((current) => ({ ...current, [action]: undefined }))
  }

  async function upload(file: File, action: 'add' | 'edit') {
    setUploadingAction(action)
    setError('')
    try {
      let ratio: string
      let previewUrl: string | undefined
      let thumbnailFile: File | undefined
      if (file.type === 'application/pdf') {
        const thumbnail = await generatePdfThumbnail(file)
        if (!thumbnail.thumbnailDataUrl) throw new Error('No se pudo generar la miniatura del PDF')
        ratio = thumbnail.aspectRatio
        previewUrl = thumbnail.thumbnailDataUrl
        const thumbnailBlob = await (await fetch(thumbnail.thumbnailDataUrl)).blob()
        thumbnailFile = new File([thumbnailBlob], `${file.name.replace(/\.pdf$/i, '')}.jpg`, { type: 'image/jpeg' })
      } else {
        ratio = await getImageAspectRatio(file)
        setLocalPreview(action, file)
      }
      if (previewUrl) {
        clearLocalPreview(action)
        setPreviewUrls((current) => ({ ...current, [action]: previewUrl }))
      }
      const body = new FormData()
      body.append('file', file)
      body.append('carpeta', 'certificaciones')
      if (thumbnailFile) body.append('thumbnail', thumbnailFile)
      const response = await fetch('/api/admin/upload', { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo subir el archivo')
      const update = { imagen_url: data.thumbnail_url || data.url, aspect_ratio: ratio }
      if (action === 'edit') setEditForm((current) => ({ ...current, ...update }))
      else setAddForm((current) => ({ ...current, ...update }))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir la imagen')
    } finally {
      setUploadingAction(null)
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>, action: 'add' | 'edit') {
    event.preventDefault()
    const form = action === 'edit' ? editForm : addForm
    if (!form.imagen_url) { setError('Sube una imagen primero'); return }
    setBusyAction(action)
    setError('')
    try {
      if (action === 'edit' && editingId) { await onUpdate(editingId, form); clearLocalPreview('edit'); setEditingId(null) }
      else { await onAdd(form); clearLocalPreview('add'); setAddForm(emptyForm) }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar')
    } finally {
      setBusyAction(null)
    }
  }

  async function remove() {
    if (!pendingDelete) return
    setBusyAction('delete')
    try { await onDelete(pendingDelete.id); setPendingDelete(null) }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar') }
    finally { setBusyAction(null) }
  }

  function fields(form: Payload, setForm: (value: Payload) => void, action: 'add' | 'edit') {
    return <>
      <input value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} className="min-w-0 rounded-xl border border-slate-300 px-3 py-2" placeholder="Título" required />
      <input value={form.institucion} onChange={(event) => setForm({ ...form, institucion: event.target.value })} className="min-w-0 rounded-xl border border-slate-300 px-3 py-2" placeholder="Institución" required />
      <input value={form.fecha} onChange={(event) => setForm({ ...form, fecha: event.target.value })} className="min-w-0 rounded-xl border border-slate-300 px-3 py-2" placeholder="Fecha" required />
      <textarea value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} className="min-w-0 rounded-xl border border-slate-300 px-3 py-2" placeholder="Descripción" rows={3} required />
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm">
          {uploadingAction === action && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploadingAction === action ? 'Subiendo...' : form.imagen_url ? 'Reemplazar imagen' : 'Subir imagen'}
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" disabled={uploadingAction !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, action) }} />
        </label>
        {(previewUrls[action] || form.imagen_url) && <img src={previewUrls[action] || form.imagen_url} alt="Vista previa" className="h-12 w-12 rounded-lg object-cover" onError={(event) => console.error('Error cargando preview:', event.currentTarget.src)} />}
      </div>
    </>
  }

  return <section>
    <h2 className="mb-4 font-serif text-xl italic text-slate-900">Cursos y certificaciones</h2>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedItems.map((item) => item.id)} strategy={rectSortingStrategy}>
        <div className="grid min-w-0 gap-3">
          {orderedItems.map((item) => <SortableItem key={item.id} id={item.id}>
            {editingId === item.id ? <form onSubmit={(event) => void submit(event, 'edit')} className="grid gap-3 rounded-2xl border border-violet-200 bg-violet-50/40 p-4">{fields(editForm, setEditForm, 'edit')}<div className="flex gap-2"><button disabled={busyAction !== null || uploadingAction !== null} className="inline-flex min-w-[6.5rem] items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">{busyAction === 'edit' && <Loader2 className="h-4 w-4 animate-spin" />}{busyAction === 'edit' ? 'Guardando...' : 'Guardar'}</button><button type="button" onClick={() => setEditingId(null)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm">Cancelar</button></div></form> : <div className="flex min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 p-4"><div className="w-24 max-w-full shrink-0 overflow-hidden rounded-xl bg-slate-100" style={{ aspectRatio: item.aspect_ratio || '1' }}><img src={item.imagen_url} alt={item.titulo} className="h-full w-full object-cover" onError={(event) => console.error('Error cargando imagen:', event.currentTarget.src)} /></div><div className="min-w-0 max-w-full flex-1 overflow-hidden break-words [overflow-wrap:anywhere]"><p className="max-w-full break-words [overflow-wrap:anywhere] font-semibold">{item.titulo}</p><p className="max-w-full break-words [overflow-wrap:anywhere] text-sm text-slate-500">{item.institucion} · {item.fecha}</p><p className="max-w-full break-words [overflow-wrap:anywhere] text-sm text-slate-600">{item.descripcion}</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => { setEditingId(item.id); setEditForm({ titulo: item.titulo, institucion: item.institucion, fecha: item.fecha, descripcion: item.descripcion, imagen_url: item.imagen_url, aspect_ratio: item.aspect_ratio }); clearLocalPreview('edit') }} className="rounded-lg p-2 text-slate-500"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => setPendingDelete(item)} disabled={busyAction !== null} className="rounded-lg p-2 text-slate-500"><Trash2 className="h-4 w-4" /></button></div></div>}
          </SortableItem>)}
        </div>
      </SortableContext>
    </DndContext>
    <form onSubmit={(event) => void submit(event, 'add')} className="mt-4 grid gap-3 rounded-2xl border border-dashed border-slate-300 p-4">{fields(addForm, setAddForm, 'add')}<button disabled={busyAction !== null || uploadingAction !== null} className="inline-flex min-w-[6.5rem] items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">{busyAction === 'add' && <Loader2 className="h-4 w-4 animate-spin" />}{busyAction === 'add' ? 'Agregando...' : 'Agregar'}</button></form>
    {(error || reorderError) && <p role="alert" className="mt-3 text-sm text-red-600">{error || reorderError}</p>}
    <ConfirmDialog isOpen={pendingDelete !== null} title={pendingDelete ? `¿Eliminar '${pendingDelete.titulo}'?` : '¿Eliminar este ítem?'} message="Esta acción no se puede deshacer." onConfirm={remove} onCancel={() => setPendingDelete(null)} />
  </section>
}
