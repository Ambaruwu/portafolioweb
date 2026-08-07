'use client'

import { KeyboardEvent, useRef, useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Loader2, Plus } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

export type TagItem = { id: string; nombre: string; destacado?: boolean }
type TagInputProps = { items: TagItem[]; onAdd: (nombre: string, destacado?: boolean) => Promise<void>; onRemove: (id: string) => Promise<void>; label: string; showFeaturedToggle?: boolean; reorderUrl?: string }

function SortableTag({ item, onRemove, removing }: { item: TagItem; onRemove: (item: TagItem) => void; removing: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 1 : undefined }
  return <span ref={setNodeRef} style={style} {...attributes} {...listeners} className={`inline-flex cursor-grab items-center gap-2 rounded-full px-3 py-1.5 text-sm ${isDragging ? 'cursor-grabbing opacity-60 shadow-lg' : ''} ${item.destacado ? 'bg-gradient-to-br from-[#F4EEFC] to-[#EEF6FE] font-semibold text-[#7C3AED]' : 'bg-[#F4EEFC] text-[#6B4FB0]'}`}><span>{item.nombre}</span><button type="button" aria-label={`Eliminar ${item.nombre}`} disabled={removing} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onRemove(item) }} className="cursor-pointer text-current/60 transition hover:text-current disabled:opacity-40">x</button></span>
}

export default function TagInput({ items, onAdd, onRemove, label, showFeaturedToggle = false, reorderUrl }: TagInputProps) {
  const [orderedIds, setOrderedIds] = useState<string[] | null>(null)
  const [value, setValue] = useState('')
  const [featured, setFeatured] = useState(false)
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<TagItem | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [reorderError, setReorderError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const trimmedValue = value.trim()

  const propIds = items.map((item) => item.id)
  const hasLocalOrder = orderedIds !== null && orderedIds.length === propIds.length && orderedIds.every((id) => propIds.includes(id))
  const orderedItems = hasLocalOrder ? orderedIds.map((id) => items.find((item) => item.id === id)).filter((item): item is TagItem => Boolean(item)) : items

  async function addCurrentValue() { if (!trimmedValue || adding) return; setAdding(true); let added = false; try { await onAdd(trimmedValue, featured); setValue(''); setFeatured(false); added = true } finally { setAdding(false); if (added) setTimeout(() => inputRef.current?.focus(), 0) } }
  async function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) { if (event.key !== 'Enter') return; event.preventDefault(); await addCurrentValue() }
  async function handleRemove(id: string) { if (removingId) return; setRemovingId(id); try { await onRemove(id) } finally { setRemovingId(null) } }
  async function confirmRemove() { if (!pendingDelete) return; await handleRemove(pendingDelete.id); setPendingDelete(null) }
  function handleDragStart(event: { active: { id: string | number } }) { setDraggingId(String(event.active.id)); setReorderError('') }
  async function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null)
    if (!reorderUrl || !event.over || event.active.id === event.over.id) return
    const oldItems = orderedItems
    const oldIndex = oldItems.findIndex((item) => item.id === event.active.id)
    const newIndex = oldItems.findIndex((item) => item.id === event.over?.id)
    if (oldIndex < 0 || newIndex < 0) return
    const nextItems = arrayMove(oldItems, oldIndex, newIndex)
    setOrderedIds(nextItems.map((item) => item.id))
    try {
      const response = await fetch(reorderUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: nextItems.map((item) => item.id) }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar el orden')
    } catch (error) { setOrderedIds(oldItems.map((item) => item.id)); setReorderError(error instanceof Error ? error.message : 'No se pudo guardar el orden') }
  }

  return <section><h2 className="mb-4 font-serif text-xl italic text-slate-900">{label}</h2><DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}><SortableContext items={orderedItems.map((item) => item.id)} strategy={rectSortingStrategy}><div className="flex max-w-full flex-wrap items-center gap-2 overflow-x-hidden">{orderedItems.map((item) => <SortableTag key={item.id} item={item} onRemove={setPendingDelete} removing={removingId === item.id} />)}<div className="flex w-full min-w-0 max-w-full basis-full flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"><input ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleKeyDown} disabled={adding} placeholder="Agregar..." className="min-w-[10rem] flex-1 bg-transparent px-0 py-1 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed" />{showFeaturedToggle && <label className="flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} disabled={adding} />Destacar</label>}<button type="button" onClick={addCurrentValue} disabled={!trimmedValue || adding} aria-label={`Agregar ${label}`} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F4EEFC] text-[#7C3AED] transition hover:bg-[#E7DDF8] hover:text-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-40">{adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}</button></div></div></SortableContext><DragOverlay>{draggingId ? <span className="rounded-full bg-[#F4EEFC] px-3 py-1.5 text-sm text-[#6B4FB0] shadow-xl">{orderedItems.find((item) => item.id === draggingId)?.nombre}</span> : null}</DragOverlay></DndContext>{reorderError && <p role="alert" className="mt-2 text-sm text-red-600">{reorderError}</p>}<ConfirmDialog isOpen={pendingDelete !== null} title={pendingDelete ? `¿Eliminar '${pendingDelete.nombre}'?` : '¿Eliminar este ítem?'} message="Esta acción no se puede deshacer." onConfirm={confirmRemove} onCancel={() => setPendingDelete(null)} /></section>
}
