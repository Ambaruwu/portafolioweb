'use client'

export const trajectoryColors = [
  { value: '#7C3AED', name: 'Morado principal' },
  { value: '#6D28D9', name: 'Morado oscuro' },
  { value: '#5B21B6', name: 'Morado profundo' },
  { value: '#60A5FA', name: 'Azul' },
  { value: '#3B82F6', name: 'Azul oscuro' },
  { value: '#EC4899', name: 'Rosa/magenta' },
] as const

type ColorPalettePickerProps = {
  value: string
  onChange: (value: string) => void
}

export default function ColorPalettePicker({ value, onChange }: ColorPalettePickerProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Seleccionar color">
      {trajectoryColors.map((color) => (
        <button
          key={color.value}
          type="button"
          title={color.name}
          aria-label={color.name}
          aria-pressed={value === color.value}
          onClick={() => onChange(color.value)}
          className={`h-7 w-7 rounded-full transition hover:scale-110 ${value === color.value ? 'ring-2 ring-slate-700 ring-offset-2' : 'ring-1 ring-black/10'}`}
          style={{ backgroundColor: color.value }}
        />
      ))}
    </div>
  )
}
