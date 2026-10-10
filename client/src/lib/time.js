const pad = (n) => String(n).padStart(2, '0');
const parts = (d, tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
  .formatToParts(new Date(d)).reduce((o, x) => ((o[x.type] = +x.value), o), {});

/** "2026-05-01T18:00" typed in `tz` -> UTC ISO string */
export function toUTC(local, tz) {
  const [d, t] = local.split('T'); const [y, m, da] = d.split('-').map(Number); const [h, mi] = t.split(':').map(Number);
  const want = Date.UTC(y, m - 1, da, h, mi); let guess = want;
  for (let i = 0; i < 2; i++) { const p = parts(guess, tz); guess += want - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute); }
  return new Date(guess).toISOString();
}
export function toLocalInput(iso, tz) { const p = parts(iso, tz); return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`; }
export const fmt = (iso, tz) => new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short', timeZone: tz });
export const timezones = () => (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC']);

const z = (s) => new Date(s).toISOString().replace(/[-:]|\.\d{3}/g, '');
const where = (e) => (e.format === 'physical' ? e.address : e.meetingUrl) || '';
export const googleCalUrl = (e) => `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${z(e.startAt)}/${z(e.endAt)}&details=${encodeURIComponent(e.description || '')}&location=${encodeURIComponent(where(e))}`;
export const icsFile = (e, uid) => ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PixelEvent//EN', 'BEGIN:VEVENT', `UID:${uid}@pixelevent`, `DTSTAMP:${z(new Date())}`,
  `DTSTART:${z(e.startAt)}`, `DTEND:${z(e.endAt)}`, `SUMMARY:${e.title}`, `DESCRIPTION:${(e.description || '').replace(/\n/g, '\\n')}`, `LOCATION:${where(e)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
export function download(name, data, type) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
