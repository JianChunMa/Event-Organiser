import mongoose from 'mongoose';
const { Schema } = mongoose;

const eventSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  // Only a SHA-256 hash of the host secret is stored; never returned by default.
  hostTokenHash: { type: String, required: true, select: false },
  title: { type: String, required: true, maxlength: 80 },
  description: { type: String, default: '', maxlength: 2000 },
  badge: { type: String, default: '🎮' },
  tags: [String],
  format: { type: String, enum: ['virtual', 'physical'], required: true },
  meetingUrl: String,
  instructions: String,
  address: String,
  coords: { lat: Number, lng: Number },
  mapsUrl: String,
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  timezone: { type: String, required: true },
  capacity: { type: Number, default: 0, min: 0 },
  registrationCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
