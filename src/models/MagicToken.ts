import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMagicToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
}

const MagicTokenSchema = new Schema<IMagicToken>({
  email: { type: String, required: true, lowercase: true, trim: true },
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
});

const MagicToken: Model<IMagicToken> = mongoose.models.MagicToken || mongoose.model<IMagicToken>('MagicToken', MagicTokenSchema);
export default MagicToken;
