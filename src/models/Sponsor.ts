import mongoose, { Schema, Document, Model } from 'mongoose';
import { SponsorTier } from '@/types';

export interface ISponsor extends Document {
  name: string;
  url: string;
  description: string;
  iconText?: string;
  tier: SponsorTier;
  active: boolean;
  priority: number;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const SponsorSchema = new Schema<ISponsor>({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  description: { type: String, required: true, maxlength: 200 },
  iconText: { type: String, default: '⚡' },
  tier: { type: String, enum: ['starter', 'featured'], default: 'starter', index: true },
  active: { type: Boolean, default: true, index: true },
  priority: { type: Number, default: 0, index: true },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
}, { timestamps: true });

const Sponsor: Model<ISponsor> = mongoose.models.Sponsor || mongoose.model<ISponsor>('Sponsor', SponsorSchema);
export default Sponsor;
