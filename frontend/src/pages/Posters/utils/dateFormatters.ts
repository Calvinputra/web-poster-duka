const monthNamesId = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember']

export function formatDateTime(value?: string): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const day = d.getDate()
  const month = monthNamesId[d.getMonth()]
  const year = d.getFullYear()
  return `${hh}:${mm}, ${day} ${month} ${year}`
}

export function formatDateTimeWithSeconds(value?: string): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const day = d.getDate()
  const month = monthNamesId[d.getMonth()]
  const year = d.getFullYear()
  return `${hh}:${mm}:${ss}, ${day} ${month} ${year}`
}

export function formatYmdWithTime(dateValue?: string, timeValue?: string): string {
  const d = (dateValue || '').trim()
  if (!d) return '-'
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d)
  if (!m) return d
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const time = (timeValue || '').trim() || '00:00'
  const [h, min] = time.split(':')
  const hh = h && /^\d+$/.test(h) ? h.padStart(2, '0') : '00'
  const mm = min && /^\d+$/.test(min) ? min.padStart(2, '0') : '00'
  return `${hh}:${mm}, ${day} ${monthNamesId[Math.max(0, Math.min(11, month - 1))]} ${year}`
}
