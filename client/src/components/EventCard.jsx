import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
export const Tags = ({ tags = [] }) => <div>{tags.map((t) => <span key={t} className="px-tag">{t}</span>)}</div>;
export default function EventCard({ to, badge, title, sub }) {
  return (
    <motion.div layout whileHover={{ x: -3, y: -3 }}>
      <Link to={to} className="px-box flex items-center gap-4 no-underline text-white block">
        <span className="text-4xl">{badge}</span>
        <div><h3 className="text-xs leading-relaxed">{title}</h3><span className="text-mute">{sub}</span></div>
      </Link>
    </motion.div>
  );
}
