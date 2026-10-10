import { useNavigate } from 'react-router-dom';
import { api, saveHost } from '../lib/api.js';
import { blip } from '../lib/sound.js';
import EventForm from '../components/EventForm.jsx';

export default function CreateEvent() {
  const nav = useNavigate();
  async function create(payload) {
    const { slug, hostToken } = await api.createEvent(payload);
    saveHost(slug, hostToken, payload.title);
    blip(990, 0.15);
    // The secret travels in the URL fragment, which browsers never send to a server.
    nav(`/host/${slug}#token=${hostToken}`, { replace: true });
  }
  return <div className="px-box"><h2 className="text-sm text-gold mb-3">▶ NEW EVENT</h2><EventForm onSubmit={create} submitLabel="SAVE & PUBLISH" /></div>;
}
