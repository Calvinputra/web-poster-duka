import type { PosterFormData } from '../types/poster'

const RELATION_LABELS: Record<string, string> = {
  ayahIbu: 'Ayah/Ibu',
  suamiIstri: 'Suami/Istri',
  anak: 'Anak',
  menantu: 'Menantu',
  cucu: 'Cucu',
  cicit: 'Cicit',
}

function parseFlexibleDateParts(raw: string): { y: number; m: number; d: number } | null {
  const t = raw.trim()
  if (!t) return null
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (!iso) return null
  const y = Number(iso[1])
  const m = Number(iso[2])
  const d = Number(iso[3])
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null
  return { y, m, d }
}

function formatDisplayDateId(dateValue: string): string {
  const parts = parseFlexibleDateParts(dateValue)
  if (!parts) return dateValue.trim()
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(parts.y, parts.m - 1, parts.d))
}

function formatTimeDot(timeValue: string): string {
  const parts = timeValue.trim().split(':')
  const h = parts[0]
  const min = parts[1]
  if (!h || min === undefined) return timeValue
  return `${h}.${min}`
}

function defaultDeathSentence(place: string, dateRaw: string, timeRaw: string, zoneRaw: string): string {
  const tgl = formatDisplayDateId(dateRaw)
  const loc = place.trim()
  const tz = (zoneRaw || 'WIB').trim() || 'WIB'
  const t = timeRaw.trim()
  const tail = t ? ` pukul ${formatTimeDot(t)} ${tz}` : ''
  if (!loc && !tgl && !tail) return ''
  if (loc && tgl) return `Telah meninggal dunia di ${loc} pada tanggal ${tgl}${tail}.`
  if (tgl) return `Telah meninggal dunia pada tanggal ${tgl}${tail}.`
  if (loc) return `Telah meninggal dunia di ${loc}${tail}.`
  return 'Telah meninggal dunia.'
}

function relationLines(value: PosterFormData): string[] {
  const summary = value.relationSummary?.trim()
  if (summary) return summary.split('\n').map((x) => x.trim()).filter(Boolean)
  const raw = value.familyData?.trim()
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const lines: string[] = []
    for (const key of Object.keys(RELATION_LABELS)) {
      const arr = parsed[key]
      if (!Array.isArray(arr)) continue
      const names = arr.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean)
      if (names.length) lines.push(`${RELATION_LABELS[key]}: ${names.join(', ')}`)
    }
    return lines
  } catch {
    return []
  }
}

function processionHeading(jenis: string): string {
  return jenis.toLowerCase() === 'dikremasi' ? 'AKAN DIKREMASI PADA' : 'AKAN DIKEBUMIKAN PADA'
}

interface PosterDukaCitaCardProps {
  value: PosterFormData
}

export function PosterDukaCitaCard({ value }: PosterDukaCitaCardProps) {
  const safe = (v?: string): string => (v ?? '').trim()
  const relations = relationLines(value)
  const deathLine = safe(value.deathStatement) || defaultDeathSentence(
    safe(value.placeOfPassing),
    safe(value.dateOfPassing),
    safe(value.timeOfPassing),
    safe(value.timeOfPassingZone),
  )
  const prosesiDate = safe(value.processionDate) ? formatDisplayDateId(safe(value.processionDate)) : ''
  const prosesiTime = safe(value.processionTime) ? `${formatTimeDot(safe(value.processionTime))} ${safe(value.processionTimeZone) || 'WIB'}` : ''

  return (
    <article className="bdc-poster theme-soft-light">
      <h1 className="bdc-headline">BERITA DUKA CITA</h1>
      <p className="bdc-subline">Telah berpulang dengan tenang:</p>
      <div className="bdc-photo-ring">
        {safe(value.imageUrl) ? <img src={safe(value.imageUrl)} alt="" className="bdc-photo" /> : <div className="bdc-photo bdc-photo-placeholder" />}
      </div>
      <h2 className="bdc-name">{safe(value.deceasedName) || 'Nama Almarhum/Almarhumah'}</h2>
      {safe(value.keterangan) ? <p className="bdc-keterangan">{safe(value.keterangan)}</p> : null}
      {safe(value.age) ? <p className="bdc-age">Usia {safe(value.age)} tahun</p> : null}
      {deathLine ? <p className="bdc-death-line">{deathLine}</p> : null}
      {relations.length > 0 ? (
        <div className="bdc-relation-block bdc-relation-block-lines">
          <p className="bdc-relation-heading">Keluarga yang ditinggalkan</p>
          <ul className="bdc-relation-ul">
            {relations.map((text, index) => (
              <li key={`rel-${index}`} className="bdc-relation-li">
                {text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="bdc-logistics">
        <div className="bdc-logistics-box">
          <h3 className="bdc-logistics-title">DISEMAYAMKAN DI</h3>
          <p className="bdc-logistics-body">{safe(value.placeLaidOut) || '—'}</p>
        </div>
        <div className="bdc-logistics-box">
          <h3 className="bdc-logistics-title">{processionHeading(safe(value.processionType))}</h3>
          <dl className="bdc-dl">
            {prosesiDate ? (
              <>
                <dt>Hari/Tanggal</dt>
                <dd>{prosesiDate}</dd>
              </>
            ) : null}
            {prosesiTime ? (
              <>
                <dt>Pukul</dt>
                <dd>{prosesiTime}</dd>
              </>
            ) : null}
            {safe(value.processionPlace) ? (
              <>
                <dt>Tempat</dt>
                <dd>{safe(value.processionPlace)}</dd>
              </>
            ) : null}
            {!prosesiDate && !prosesiTime && !safe(value.processionPlace) ? <dd className="bdc-muted">—</dd> : null}
          </dl>
        </div>
      </div>
      <p className="bdc-condolence">{safe(value.condolenceMessage) || '…'}</p>
      <p className="bdc-hormat">Hormat kami,</p>
      <p className="bdc-signature">{safe(value.messageFrom) || 'Nama pengirim'}</p>
    </article>
  )
}
