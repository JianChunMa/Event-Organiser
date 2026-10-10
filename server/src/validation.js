import { z } from 'zod';

const str = (max) => z.string().trim().max(max);
const base = z.object({
  title: str(80).min(1, 'Title is required'),
  description: str(2000).default(''),
  badge: str(8).default('🎮'),
  tags: z.array(str(24)).max(8).default([]),
  format: z.enum(['virtual', 'physical']),
  meetingUrl: z.string().trim().url().max(500).optional().or(z.literal('')),
  instructions: str(500).optional(),
  address: str(300).optional(),
  coords: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  timezone: str(64).min(1),
  capacity: z.number().int().min(0).max(100000).default(0),
});

const refine = (s) => s
  .refine((d) => d.endAt > d.startAt, { path: ['endAt'], message: 'End must be after start' })
  .refine((d) => d.format !== 'virtual' || d.meetingUrl, { path: ['meetingUrl'], message: 'Meeting link required for virtual events' })
  .refine((d) => d.format !== 'physical' || d.address || d.coords, { path: ['address'], message: 'Address or coordinates required for physical events' });

export const eventInput = refine(base);

export const registrationInput = z.object({
  name: str(80).min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().email('Valid email required').max(120),
  contact: str(80).optional().default(''),
  notes: str(500).optional().default(''),
});
