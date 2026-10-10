import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api, hosted, saveHost, forgetHost } from '../lib/api.js';
import { download } from '../lib/time.js';
import EventForm from '../components/EventForm.jsx';

export default function HostDashboard() {
  const { slug } = useParams(); const nav = useNavigate();
  // Token: from URL fragment (first visit via secret link) or this browser's saved copy.
  const [token] = useState(() => new URLSearchParams(location.hash.slice(1)).get('token') || hosted()[slug]?.token || '');
  const [data, setData] = useState(null); const [err, setErr] = useState(''); const [q, setQ] = useState(''); const [edit, setEdit] = useState(false); const [msg, setMsg] = useState('');
  const pub = `${location.origin}/events/${slug}`;
  const secret = `${location.origin}/host/${slug}#token=${token}`;

  const load = useCallback(() => api.hostGet(slug, token).then((d) => { setData(d); saveHost(slug, token, d.event.title); history.replaceState(null, '', location.pathname); }).catch((e) => setErr(e.status === 401 ? 'Host access denied. Open your secret host link.' : e.message)), [slug, token]);
  useEffect(() => { token ? load() : setErr('Host access denied. Open your secret host link.'); }, [load, token]);

  const rows = useMemo(() => (data?.registrations || []).filter((r) => [r.name, r.email, r.contact, r.notes, r.code].join(' ').toLowerCase().includes(q.toLowerCase())), [data, q]);
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 1800); };
  const copy = async (t, label) => { try { await navigator.clipboard.writeText(t); flash(label + ' COPIED'); } catch { prompt('Copy:', t); } };
  const exp = async (fmt) => { const r = await api.hostExport(slug, token, fmt); download(`${slug}-guests.${fmt}`, await r.blob()); };

  if (err) return <div className="px-box"><h2 className="text-sm text-hot">ACCESS DENIED</h2><p>{err}</p></div>;
  if (!data) return <div className="px-box animate-pulse">LOADING…</div>;
  const ev = data.event;

  return (<>
    <div className="px-box"><div className="flex items-center gap-3"><span className="text-4xl">{ev.badge}</span><h2 className="text-sm leading-relaxed">{ev.title}</h2></div>
      <p className="text-mute">HOST DASHBOARD · {ev.registrationCount}{ev.capacity ? ` / ${ev.capacity}` : ''} registered</p>
      <div className="flex gap-2 flex-wrap"><button className="px-btn" onClick={() => setEdit(!edit)}>{edit ? 'CLOSE EDITOR' : '✎ EDIT EVENT'}</button>
        <a className="px-btn ghost" href={pub} target="_blank" rel="noopener noreferrer">VIEW PUBLIC PAGE</a>
        <button className="px-btn hot" onClick={async () => { if (confirm('Delete this event and all RSVPs?')) { await api.hostDelete(slug, token); forgetHost(slug); nav('/'); } }}>DELETE</button></div>
      {msg && <p className="text-gold font-pixel text-[10px] mt-3">{msg}</p>}
    </div>

    {edit && <div className="px-box"><h2 className="text-xs text-gold mb-3">EDIT EVENT</h2>
      <EventForm initial={ev} submitLabel="SAVE CHANGES" onSubmit={async (p) => { await api.hostUpdate(slug, token, p); await load(); setEdit(false); flash('SAVED'); }} /></div>}

    <div className="px-box"><h2 className="text-xs text-gold mb-3">SHARE HUB</h2>
      <p className="text-mute">Public link (guests can only view + RSVP):</p>
      <p className="break-all">{pub}</p>
      <div className="flex gap-2 flex-wrap mb-4"><button className="px-btn" onClick={() => copy(pub, 'LINK')}>COPY PUBLIC LINK</button>
        <button className="px-btn ghost" onClick={() => copy(secret, 'HOST LINK')}>COPY SECRET HOST LINK</button></div>
      <div className="inline-block bg-white p-3 border-4 border-black shadow-[4px_4px_0_#ff2e97]"><QRCodeSVG value={pub} size={160} /></div>
      <p className="text-hot mt-3">⚠ Keep the host link private. Anyone with it can edit this event.</p></div>

    <div className="px-box"><h2 className="text-xs text-gold mb-3">ATTENDEES ({rows.length})</h2>
      <div className="flex gap-2 flex-wrap mb-3"><input className="px-input flex-1 min-w-[160px]" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="px-btn" onClick={() => exp('csv')}>CSV</button><button className="px-btn hot" onClick={() => exp('json')}>JSON</button></div>
      <div className="overflow-x-auto">{rows.length ? (
        <table className="w-full min-w-[560px] text-left"><thead><tr className="font-pixel text-[9px] text-gold">{['CODE', 'NAME', 'EMAIL', 'CONTACT', 'NOTES', ''].map((h) => <th key={h} className="p-1.5">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => (<tr key={r._id} className="border-t-2 border-dashed border-mute">
            <td className="p-1.5">{r.code}</td><td className="p-1.5">{r.name}</td><td className="p-1.5">{r.email}</td><td className="p-1.5">{r.contact}</td><td className="p-1.5">{r.notes}</td>
            <td className="p-1.5"><button className="px-btn ghost" onClick={async () => { if (confirm('Remove guest?')) { await api.hostRemoveReg(slug, token, r._id); load(); } }}>✕</button></td></tr>))}</tbody></table>
      ) : <p className="text-mute">No players yet.</p>}</div></div>
  </>);
}
