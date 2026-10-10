import crypto from 'node:crypto';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { registrationInput } from '../validation.js';
import { HttpError } from '../utils/http.js';

export async function register(req, res) {
  const input = registrationInput.parse(req.body);
  const ev = await Event.findOne({ slug: req.params.slug });
  if (!ev) throw new HttpError(404, 'Event not found');
  if (new Date() > ev.endAt) throw new HttpError(410, 'This event has ended');

  // Atomically claim a seat so concurrent RSVPs can't exceed capacity.
  const claimed = await Event.findOneAndUpdate(
    { _id: ev._id, $or: [{ capacity: 0 }, { $expr: { $lt: ['$registrationCount', '$capacity'] } }] },
    { $inc: { registrationCount: 1 } },
  );
  if (!claimed) throw new HttpError(409, 'Sold out');

  try {
    const code = 'PX-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const reg = await Registration.create({ ...input, eventId: ev._id, code });
    res.status(201).json({ code: reg.code, name: reg.name });
  } catch (err) {
    await Event.updateOne({ _id: ev._id }, { $inc: { registrationCount: -1 } }); // release the seat
    if (err.code === 11000) throw new HttpError(409, 'This email is already registered');
    throw err;
  }
}

export async function hostRemoveRegistration(req, res) {
  const del = await Registration.findOneAndDelete({ _id: req.params.id, eventId: req.event._id });
  if (!del) throw new HttpError(404, 'Registration not found');
  await Event.updateOne({ _id: req.event._id }, { $inc: { registrationCount: -1 } });
  res.status(204).end();
}

const cell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function hostExport(req, res) {
  const rows = await Registration.find({ eventId: req.event._id }).sort('createdAt').lean();
  const clean = rows.map((r) => ({ code: r.code, name: r.name, email: r.email, contact: r.contact, notes: r.notes, registeredAt: r.createdAt }));
  if (req.query.format === 'json') {
    res.set('Content-Disposition', `attachment; filename="${req.event.slug}-guests.json"`);
    return res.json(clean);
  }
  const head = 'code,name,email,contact,notes,registeredAt';
  const body = clean.map((r) => [r.code, r.name, r.email, r.contact, r.notes, r.registeredAt.toISOString()].map(cell).join(','));
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${req.event.slug}-guests.csv"` });
  res.send([head, ...body].join('\n'));
}
