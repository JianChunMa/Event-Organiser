import { Link } from 'react-router-dom';
import { hosted } from '../lib/api.js';
import EventCard from '../components/EventCard.jsx';

export default function Home() {
  const mine = Object.entries(hosted());
  return (<>
    <div className="px-box"><h2 className="text-sm text-gold mb-3">PLAYER 1 READY</h2>
      <p>Create an event, share the public link, and guests RSVP instantly. No accounts. <span className="animate-pulse">▮</span></p>
      <Link to="/new" className="px-btn hot mt-3">+ CREATE EVENT</Link></div>
    <h2 className="text-xs text-gold mb-4">EVENTS YOU HOST (THIS BROWSER)</h2>
    {mine.length ? mine.map(([slug, h]) => <EventCard key={slug} to={`/host/${slug}`} badge="🎛️" title={h.title} sub="Open host dashboard" />)
      : <div className="px-box text-mute">No events yet. Press START.</div>}
  </>);
}
