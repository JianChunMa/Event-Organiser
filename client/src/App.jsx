import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Home from './pages/Home.jsx';
import CreateEvent from './pages/CreateEvent.jsx';
import EventPublic from './pages/EventPublic.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import { isSoundOn, toggleSound, blip } from './lib/sound.js';

const Page = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
    {children}
  </motion.div>
);

export default function App() {
  const loc = useLocation();
  const [snd, setSnd] = useState(isSoundOn());
  // Guests on a public event link see a focused page: no navigation to home or "new event".
  const isPublic = loc.pathname.startsWith('/events/');
  const logo = <h1 className="text-lg sm:text-2xl text-neon" style={{ textShadow: '3px 3px 0 #ff2e97' }}>👾 PIXELEVENT</h1>;
  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {isPublic ? logo : <Link to="/" className="no-underline">{logo}</Link>}
        <nav className="flex gap-2">
          {!isPublic && <Link to="/new" className="px-btn hot">+ NEW EVENT</Link>}
          <button className="px-btn ghost" aria-label="Toggle sound" onClick={() => { setSnd(toggleSound()); blip(880); }}>{snd ? '🔊' : '🔇'}</button>
        </nav>
      </header>
      <AnimatePresence mode="wait">
        <Routes location={loc} key={loc.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/new" element={<Page><CreateEvent /></Page>} />
          <Route path="/events/:slug" element={<Page><EventPublic /></Page>} />
          <Route path="/host/:slug" element={<Page><HostDashboard /></Page>} />
          <Route path="*" element={<Page><div className="px-box"><h2>404 · GAME OVER</h2></div></Page>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
