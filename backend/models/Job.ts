import mongoose, { Document } from 'mongoose';

interface IBid {
  artisanId: mongoose.Types.ObjectId;
  amount: number;
  accepted: boolean;
  createdAt: Date;
}

export interface IJob extends Document {
  clientId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'completed';
  bids: IBid[];
  location: {
    type: string;
    coordinates: number[];
  };
  suggestedPrice?: number;
}

const jobSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'assigned', 'completed'], default: 'open' },
  bids: [{
    artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    accepted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  suggestedPrice: { type: Number }
}, { timestamps: true });

jobSchema.index({ location: '2dsphere' });

export default mongoose.model<IJob>('Job', jobSchema);