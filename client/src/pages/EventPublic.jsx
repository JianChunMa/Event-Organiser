import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { fmt, googleCalUrl, icsFile, download } from '../lib/time.js';
import { blip } from '../lib/sound.js';
import { Tags } from '../components/EventCard.jsx';

/** PUBLIC VIEW: read-only event details + RSVP form. There are no edit controls here, and the API has no public write route beyond RSVP. */
export default function EventPublic() {
  const { slug } = useParams();
  const [ev, setEv] = useState(null); const [err, setErr] = useState('');
  const [f, setF] = useState({ name: '', email: '', contact: '', notes: '' });
  const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false); const [ticket, setTicket] = useState(null);

  useEffect(() => { api.getEvent(slug).then(setEv).catch((e) => setErr(e.message)); }, [slug]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErrs({});
    try {
      const t = await api.register(slug, f);
      setTicket(t); blip(784, 0.1); setTimeout(() => blip(1046, 0.15), 120);
      setEv(await api.getEvent(slug));
    } catch (x) {
      const m = {}; (x.details || []).forEach((d) => (m[d.field] = d.message));
      setErrs(Object.keys(m).length ? m : { form: x.message });
    } finally { setBusy(false); }
  }

  if (err) return <div className="px-box"><h2 className="text-sm">GAME OVER</h2><p>{err}</p></div>;
  if (!ev) return <div className="px-box animate-pulse">LOADING…</div>;

  return (<>
    <div className="px-box">
      <div className="flex items-center gap-4 p-3 mb-3 border-4 border-black bg-gradient-to-r from-hot to-neon">
        <span className="text-5xl" style={{ filter: 'drop-shadow(4px 4px 0 #000)' }}>{ev.badge}</span>
        <h2 className="text-black text-sm leading-relaxed m-0">{ev.title}</h2>
      </div>
      <Tags tags={ev.tags} />
      <p className="mt-2">🕒 {fmt(ev.startAt, ev.timezone)}<br />→ {fmt(ev.endAt, ev.timezone)} <span className="text-mute">({ev.timezone})</span></p>
      {ev.format === 'physical'
        ? <p>📍 {ev.address} {ev.mapsUrl && <a href={ev.mapsUrl} target="_blank" rel="noopener noreferrer">GET DIRECTIONS ▶</a>}</p>
        : <p>💻 {ev.meetingUrl && <a href={ev.meetingUrl} target="_blank" rel="noopener noreferrer">{ev.meetingUrl}</a>}{ev.instructions && <><br /><span className="text-mute">{ev.instructions}</span></>}</p>}
      <p className="whitespace-pre-wrap">{ev.description}</p>
      <p className="text-mute">{ev.registrationCount}{ev.capacity ? ` / ${ev.capacity}` : ''} registered</p>
    </div>

    <div className="px-box">
      {ticket ? (<>
        <h2 className="text-sm text-gold mb-3">★ YOU'RE IN! ★</h2>
        <motion.div className="ticket bg-gold text-black border-4 border-black shadow-pxl p-5 my-4"
          initial={{ y: -140, rotate: -8, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 12 }}>
          <div className="font-pixel text-[9px]">ADMIT ONE · {ticket.code}</div>
          <h3 className="text-xs my-2 leading-relaxed">{ev.title}</h3>
          <div>{ticket.name}<br />{fmt(ev.startAt, ev.timezone)}</div>
        </motion.div>
        <div className="flex gap-2 flex-wrap">
          <a className="px-btn" href={googleCalUrl(ev)} target="_blank" rel="noopener noreferrer">+ GOOGLE CAL</a>
          <button className="px-btn hot" onClick={() => download(`${slug}.ics`, icsFile(ev, ticket.code), 'text/calendar')}>⬇ .ICS</button>
        </div></>
      ) : ev.isFull ? <h2 className="text-sm text-hot animate-pulse">SOLD OUT</h2> : (
        <form onSubmit={submit}>
          <h2 className="text-sm text-gold mb-3">INSERT COIN → RSVP</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="px-label">NAME *</label><input className="px-input" required maxLength={80} value={f.name} onChange={set('name')} />{errs.name && <div className="px-err">{errs.name}</div>}</div>
            <div><label className="px-label">EMAIL *</label><input className="px-input" type="email" required value={f.email} onChange={set('email')} />{errs.email && <div className="px-err">{errs.email}</div>}</div>
          </div>
          <label className="px-label">PHONE / DISCORD</label><input className="px-input" maxLength={80} value={f.contact} onChange={set('contact')} />
          <label className="px-label">NOTES</label><textarea className="px-input" rows={2} maxLength={500} value={f.notes} onChange={set('notes')} />
          {errs.form && <div className="px-err">▲ {errs.form}</div>}
          <p className="mt-4"><button className="px-btn" disabled={busy}>{busy ? 'SENDING…' : 'GET MY PASS'}</button></p>
        </form>)}
    </div>
  </>);
}
