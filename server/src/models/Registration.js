import mongoose from 'mongoose';
const { Schema } = mongoose;

const registrationSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  contact: String,
  notes: String,
}, { timestamps: true });

registrationSchema.index({ eventId: 1, email: 1 }, { unique: true }); // one RSVP per email per event

export default mongoose.model('Registration', registrationSchema);
