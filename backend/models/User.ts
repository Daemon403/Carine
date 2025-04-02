import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'artisan' | 'client';
  profile: {
    skills?: string[];
    rating?: number;
    location?: {
      type: string;
      coordinates: number[];
    };
  };
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['artisan', 'client'], required: true },
  profile: {
    skills: { type: [String], default: [] },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  }
});

userSchema.index({ 'profile.location': '2dsphere' });

export default mongoose.model<IUser>('User', userSchema);