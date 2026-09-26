// New York time helpers. Stock feeds follow US equities 24/5, so market state and expiries are defined in
// America/New_York regardless of where the user is.

const NY = 'America/New_York'

/** Minutes offset of New York from UTC at a given instant (e.g. -240 in summer, -300 in winter). */
function nyOffsetMinutes(at: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: NY, timeZoneName: 'shortOffset' }).formatToParts(at)
  const tz = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-5'
  const m = tz.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  if (!m) return -300
  const sign = m[1] === '-' ? -1 : 1
  return sign * (Number(m[2]) * 60 + Number(m[3] ?? 0))
}

/** Wall-clock parts in New York for an instant. */
function nyParts(at: Date) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: NY, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(at)
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? ''
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { weekday: wd, year: Number(get('year')), month: Number(get('month')), day: Number(get('day')), hour: Number(get('hour')) % 24, minute: Number(get('minute')) }
}

/** UTC instant for a New York wall-clock time. */
function fromNy(year: number, month: number, day: number, hour: number, minute = 0) {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute))
  return new Date(guess.getTime() - nyOffsetMinutes(guess) * 60_000)
}

/** 24/5 session: open from Sunday 20:00 to Friday 20:00 New York time. */
export function isMarketSession(at = new Date()) {
  const { weekday, hour } = nyParts(at)
  if (weekday === 6) return false
  if (weekday === 5) return hour < 20
  if (weekday === 0) return hour >= 20
  return true
}

/** Upcoming Friday 16:00 New York expiries (skips one that is less than a day away). */
export function upcomingExpiries(count = 4, at = new Date()) {
  const out: Date[] = []
  const p = nyParts(at)
  const base = new Date(Date.UTC(p.year, p.month - 1, p.day))
  for (let i = 0; out.length < count && i < 60; i++) {
    const d = new Date(base.getTime() + i * 86_400_000)
    if (d.getUTCDay() !== 5) continue
    const exp = fromNy(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 16)
    if (exp.getTime() - at.getTime() > 86_400_000) out.push(exp)
  }
  return out
}

export function fmtExpiry(d: Date) {
  return new Intl.DateTimeFormat('en-US', { timeZone: NY, weekday: 'short', month: 'short', day: 'numeric' }).format(d) + ' · 16:00 ET'
}

export function fmtNyTime(d: Date) {
  return new Intl.DateTimeFormat('en-US', { timeZone: NY, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(d) + ' ET'
}
