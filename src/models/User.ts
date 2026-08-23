import mongoose, { Schema, Document, Model } from 'mongoose';
import { PlanType, UserRole } from '@/types';

export interface IUser extends Document {
  clerkId?: string;
  email: string;
  role: UserRole;
  plan: PlanType;
  suspended: boolean;
  adminNotes?: string;
  stripeCustomerId?: string;
  scansUsedThisMonth: number;
  scansResetDate: Date;
  createdAt: Date;
  canScan: () => { allowed: boolean; reason?: string; remaining?: number };
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, sparse: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  suspended: { type: Boolean, default: false, index: true },
  adminNotes: { type: String },
  stripeCustomerId: { type: String },
  scansUsedThisMonth: { type: Number, default: 0 },
  scansResetDate: { type: Date, default: () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }},
}, { timestamps: true });

// Method to check if user can scan
UserSchema.methods.canScan = function(): { allowed: boolean; reason?: string; remaining?: number } {
  if (this.suspended) {
    return { allowed: false, reason: 'Your account is suspended. Contact support.' };
  }

  if (this.plan === 'pro') return { allowed: true };
  
  // Check if scansResetDate has passed, reset if so
  if (new Date() > this.scansResetDate) {
    this.scansUsedThisMonth = 0;
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1);
    nextReset.setHours(0, 0, 0, 0);
    this.scansResetDate = nextReset;
  }
  
  const FREE_MONTHLY_CAP = 3;
  const remaining = FREE_MONTHLY_CAP - this.scansUsedThisMonth;
  
  if (this.scansUsedThisMonth >= FREE_MONTHLY_CAP) {
    return { allowed: false, reason: `You've used all ${FREE_MONTHLY_CAP} of your free scans this month. Upgrade to Pro for unlimited scans.`, remaining: 0 };
  }
  
  return { allowed: true, remaining };
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
