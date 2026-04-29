import { useEffect, useRef } from 'react'
import flatpickr from 'flatpickr'
import type { Instance } from 'flatpickr/dist/types/instance'
import 'flatpickr/dist/flatpickr.min.css'

const DEFAULT_ZONES = ['WIB', 'WITA', 'WIT'] as const

function mergeDateTimeForPicker(dateStr: string, timeStr: string): Date | undefined {
  const d = dateStr.trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d)
  if (!iso) return undefined
  const y = Number(iso[1])
  const m = Number(iso[2]) - 1
  const day = Number(iso[3])
  let h = 0
  let mi = 0
  let s = 0
  const t = timeStr.trim()
  if (t) {
    const p = t.split(':')
    h = Number(p[0]) || 0
    mi = Number(p[1]) || 0
    s = Number(p[2]) || 0
  }
  return new Date(y, m, day, h, mi, s)
}

function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatHis(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

export interface DateTimeZoneFieldProps {
  inputId: string
  label: string
  hint?: string
  dateStr: string
  timeStr: string
  zone: string
  onDateTimeChange: (dateStr: string, timeStr: string) => void
  onZoneChange: (zone: string) => void
  zoneOptions?: readonly string[]
  placeholder?: string
}

export function DateTimeZoneField({
  inputId,
  label,
  hint,
  dateStr,
  timeStr,
  zone,
  onDateTimeChange,
  onZoneChange,
  zoneOptions = DEFAULT_ZONES,
  placeholder = 'Klik untuk pilih tanggal, jam, detik',
}: DateTimeZoneFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const fpRef = useRef<Instance | null>(null)
  const onDateTimeChangeRef = useRef(onDateTimeChange)

  useEffect(() => {
    onDateTimeChangeRef.current = onDateTimeChange
  }, [onDateTimeChange])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return undefined

    const fp = flatpickr(el, {
      enableTime: true,
      enableSeconds: true,
      time_24hr: true,
      dateFormat: 'Y-m-d H:i:S',
      allowInput: false,
      onChange: (selectedDates) => {
        const d = selectedDates[0]
        if (!d) {
          onDateTimeChangeRef.current('', '')
          return
        }
        onDateTimeChangeRef.current(formatYmd(d), formatHis(d))
      },
    })
    fpRef.current = fp

    return () => {
      fp.destroy()
      fpRef.current = null
    }
  }, [])

  useEffect(() => {
    const fp = fpRef.current
    if (!fp) return
    const merged = mergeDateTimeForPicker(dateStr, timeStr)
    if (!merged) {
      fp.clear()
      return
    }
    fp.setDate(merged, false)
  }, [dateStr, timeStr])

  return (
    <div className="form-label bdc-datetime-zone-block">
      <span>{label}</span>
      {hint ? <span className="bdc-hint-block">{hint}</span> : null}
      <div className="bdc-datetime-zone-row">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          className="bdc-flatpickr-input"
          placeholder={placeholder}
          readOnly
          aria-label={label}
        />
        <select
          className="bdc-zone-select-inline"
          value={zone}
          onChange={(e) => onZoneChange(e.target.value)}
          aria-label={`Zona waktu ${label}`}
        >
          {zoneOptions.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
