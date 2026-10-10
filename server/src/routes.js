import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler as h } from './utils/http.js';
import * as ev from './controllers/eventController.js';
import * as reg from './controllers/registrationController.js';

const r = Router();
const writeLimit = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });

/* PUBLIC: read event details + submit an RSVP. Nothing else. */
r.post('/events', writeLimit, h(ev.createEvent));
r.get('/events/:slug', h(ev.getPublicEvent));
r.post('/events/:slug/registrations', writeLimit, h(reg.register));

/* HOST: everything below needs the secret x-host-token header. */
const host = h(ev.requireHost);
r.get('/host/events/:slug', host, h(ev.hostGetEvent));
r.patch('/host/events/:slug', host, h(ev.hostUpdateEvent));
r.delete('/host/events/:slug', host, h(ev.hostDeleteEvent));
r.delete('/host/events/:slug/registrations/:id', host, h(reg.hostRemoveRegistration));
r.get('/host/events/:slug/export', host, h(reg.hostExport));

export default r;
