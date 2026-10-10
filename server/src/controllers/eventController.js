import crypto from 'node:crypto';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { eventInput } from '../validation.js';
import { buildMapsLink } from '../utils/maps.js';
import { HttpError } from '../utils/http.js';

const sha = (s) => crypto.createHash('sha256').update(s).digest();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'event';

/** Fields safe to show anyone with the public link. No host secret, no guest list. */
export const toPublic = (e) => ({
  slug: e.slug, title: e.title, description: e.description, badge: e.badge, tags: e.tags,
  format: e.format, meetingUrl: e.meetingUrl, instructions: e.instructions,
  address: e.address, mapsUrl: e.mapsUrl, startAt: e.startAt, endAt: e.endAt, timezone: e.timezone,
  capacity: e.capacity, registrationCount: e.registrationCount,
  isFull: e.capacity > 0 && e.registrationCount >= e.capacity,
});

const apply = (data) => ({
  ...data,
  mapsUrl: data.format === 'physical' ? buildMapsLink({ address: data.address, lat: data.coords?.lat, lng: data.coords?.lng }) : '',
  // clear fields that don't apply to the chosen format
  ...(data.format === 'virtual' ? { address: '', coords: undefined } : { meetingUrl: '', instructions: '' }),
});

export async function createEvent(req, res) {
  const data = eventInput.parse(req.body);
  const hostToken = crypto.randomBytes(24).toString('base64url');
  const slug = `${slugify(data.title)}-${crypto.randomBytes(3).toString('hex')}`;
  await Event.create({ ...apply(data), slug, hostTokenHash: sha(hostToken).toString('hex') });
  res.status(201).json({ slug, hostToken }); // token is shown ONCE
}

export async function getPublicEvent(req, res) {
  const e = await Event.findOne({ slug: req.params.slug }).lean();
  if (!e) throw new HttpError(404, 'Event not found');
  res.json(toPublic(e));
}

/** Middleware: requires the host secret in the x-host-token header. */
export async function requireHost(req, _res, next) {
  const token = req.get('x-host-token');
  const e = await Event.findOne({ slug: req.params.slug }).select('+hostTokenHash');
  if (!e) throw new HttpError(404, 'Event not found');
  const ok = token && crypto.timingSafeEqual(sha(token), Buffer.from(e.hostTokenHash, 'hex'));
  if (!ok) throw new HttpError(401, 'Host access required');
  req.event = e;
  next();
}

export async function hostGetEvent(req, res) {
  const registrations = await Registration.find({ eventId: req.event._id }).sort('-createdAt').lean();
  res.json({ event: { ...toPublic(req.event), coords: req.event.coords }, registrations });
}

export async function hostUpdateEvent(req, res) {
  const cur = req.event.toObject();
  const data = eventInput.parse({ ...cur, ...req.body });
  if (data.capacity > 0 && data.capacity < cur.registrationCount) {
    throw new HttpError(409, `Capacity can't be lower than current registrations (${cur.registrationCount})`);
  }
  req.event.set(apply(data));
  await req.event.save();
  res.json(toPublic(req.event));
}

export async function hostDeleteEvent(req, res) {
  await Registration.deleteMany({ eventId: req.event._id });
  await req.event.deleteOne();
  res.status(204).end();
}
