import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminLog extends Document {
  adminUserId: mongoose.Types.ObjectId | string;
  adminEmail: string;
  action: string;
  targetId?: string;
  targetType?: string;
  note?: string;
  timestamp: Date;
}

const AdminLogSchema = new Schema<IAdminLog>({
  adminUserId: { type: Schema.Types.Mixed, required: true, index: true },
  adminEmail: { type: String, required: true },
  action: { type: String, required: true, index: true },
  targetId: { type: String },
  targetType: { type: String },
  note: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
});

const AdminLog: Model<IAdminLog> = mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
export default AdminLog;
