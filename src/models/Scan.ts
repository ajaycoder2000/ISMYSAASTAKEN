import mongoose, { Schema, Document, Model } from 'mongoose';
import { SaturationLevel, ICompetitor } from '@/types';
import { nanoid } from 'nanoid';

export interface IScan extends Document {
  userId: mongoose.Types.ObjectId | null;
  ideaText: string;
  competitors: ICompetitor[];
  saturationScore: SaturationLevel;
  saturationReasoning: string;
  gapAnalysis: string;
  shareSlug: string;
  featured: boolean;
  createdAt: Date;
}

const CompetitorSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  pricing: { type: String, default: 'Unknown' },
  url: { type: String, required: true },
}, { _id: false });

const ScanSchema = new Schema<IScan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  ideaText: { type: String, required: true, maxlength: 500 },
  competitors: [CompetitorSchema],
  saturationScore: { type: String, enum: ['low', 'medium', 'high'], required: true, index: true },
  saturationReasoning: { type: String, required: true },
  gapAnalysis: { type: String, required: true },
  shareSlug: { type: String, unique: true, index: true, default: () => nanoid(10) },
  featured: { type: Boolean, default: false, index: true },
}, { timestamps: true });

const Scan: Model<IScan> = mongoose.models.Scan || mongoose.model<IScan>('Scan', ScanSchema);
export default Scan;
