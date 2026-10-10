import { useState } from 'react';
import { timezones, toUTC, toLocalInput } from '../lib/time.js';

const BADGES = ['🎮', '🕹️', '👾', '🚀', '🎲', '🎸', '🧪', '🍕', '🏆', '💾'];
const Err = ({ errs, f }) => (errs[f] ? <div className="px-err">▲ {errs[f]}</div> : null);

export default function EventForm({ initial, onSubmit, submitLabel }) {
  const tz0 = initial?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const [f, setF] = useState({
    title: initial?.title || '', description: initial?.description || '', badge: initial?.badge || BADGES[0],
    format: initial?.format || 'virtual', meetingUrl: initial?.meetingUrl || '', instructions: initial?.instructions || '',
    address: initial?.address || '', timezone: tz0, capacity: initial?.capacity || 0, tags: (initial?.tags || []).join(', '),
    start: initial ? toLocalInput(initial.startAt, tz0) : '', end: initial ? toLocalInput(initial.endAt, tz0) : '',
  });
  const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit() {
    if (!f.start || !f.end) return setErrs({ start: !f.start && 'Required', end: !f.end && 'Required' });
    setBusy(true); setErrs({});
    try {
      await onSubmit({
        title: f.title, description: f.description, badge: f.badge, format: f.format, timezone: f.timezone,
        meetingUrl: f.format === 'virtual' ? f.meetingUrl : '', instructions: f.format === 'virtual' ? f.instructions : '',
        address: f.format === 'physical' ? f.address : '',
        startAt: toUTC(f.start, f.timezone), endAt: toUTC(f.end, f.timezone), capacity: Number(f.capacity) || 0,
        tags: f.tags.split(',').map((t) => t.trim().replace(/^#*/, '#')).filter((t) => t.length > 1),
      });
    } catch (e) {
      const m = {}; (e.details || []).forEach((d) => (m[d.field] = d.message));
      setErrs(Object.keys(m).length ? m : { form: e.message });
    } finally { setBusy(false); }
  }

  return (
    <div>
      <label className="px-label">BADGE</label>
      <div className="flex flex-wrap gap-2">{BADGES.map((b) => (
        <button type="button" key={b} onClick={() => setF({ ...f, badge: b })}
          className={`text-3xl px-2 py-1 border-[3px] ${f.badge === b ? 'bg-gold border-black scale-110' : 'bg-crt border-white'}`}>{b}</button>))}</div>
      <label className="px-label">TITLE</label><input className="px-input" maxLength={80} value={f.title} onChange={set('title')} /><Err errs={errs} f="title" />
      <label className="px-label">DESCRIPTION</label><textarea className="px-input" rows={3} value={f.description} onChange={set('description')} />
      <label className="px-label">FORMAT</label>
      <select className="px-input" value={f.format} onChange={set('format')}><option value="virtual">Virtual</option><option value="physical">Physical</option></select>
      {f.format === 'virtual' ? (<>
        <label className="px-label">MEETING LINK</label><input className="px-input" placeholder="https://meet.google.com/..." value={f.meetingUrl} onChange={set('meetingUrl')} /><Err errs={errs} f="meetingUrl" />
        <label className="px-label">ACCESS INSTRUCTIONS</label><input className="px-input" value={f.instructions} onChange={set('instructions')} />
      </>) : (<>
        <label className="px-label">ADDRESS</label><input className="px-input" placeholder="123 Main St, City" value={f.address} onChange={set('address')} /><Err errs={errs} f="address" />
      </>)}
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="px-label">STARTS</label><input type="datetime-local" className="px-input" value={f.start} onChange={set('start')} /><Err errs={errs} f="start" /></div>
        <div><label className="px-label">ENDS</label><input type="datetime-local" className="px-input" value={f.end} onChange={set('end')} /><Err errs={errs} f="endAt" /><Err errs={errs} f="end" /></div>
        <div><label className="px-label">TIMEZONE</label><select className="px-input" value={f.timezone} onChange={set('timezone')}>{timezones().map((z) => <option key={z}>{z}</option>)}</select></div>
        <div><label className="px-label">CAPACITY (0 = ∞)</label><input type="number" min="0" className="px-input" value={f.capacity} onChange={set('capacity')} /><Err errs={errs} f="capacity" /></div>
      </div>
      <label className="px-label">TAGS (comma separated)</label><input className="px-input" placeholder="Gaming, Meetup" value={f.tags} onChange={set('tags')} />
      <Err errs={errs} f="form" />
      <p className="mt-5"><button className="px-btn" disabled={busy} onClick={submit}>{busy ? 'SAVING…' : submitLabel}</button></p>
    </div>
  );
}
