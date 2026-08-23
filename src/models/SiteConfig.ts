import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteConfig extends Document {
  freeTierMonthlyLimit: number;
  proMonthlyPrice: number;
  proYearlyPrice: number;
  estimatedCostPerScan: number;
  updatedAt: Date;
}

const SiteConfigSchema = new Schema<ISiteConfig>({
  freeTierMonthlyLimit: { type: Number, default: 3 },
  proMonthlyPrice: { type: Number, default: 12 },
  proYearlyPrice: { type: Number, default: 99 },
  estimatedCostPerScan: { type: Number, default: 0.02 },
}, { timestamps: true });

const SiteConfigModel: Model<ISiteConfig> = mongoose.models.SiteConfig || mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);

export async function getSiteConfig(): Promise<ISiteConfig> {
  let config = await SiteConfigModel.findOne();
  if (!config) {
    config = await SiteConfigModel.create({
      freeTierMonthlyLimit: 3,
      proMonthlyPrice: 12,
      proYearlyPrice: 99,
      estimatedCostPerScan: 0.02,
    });
  }
  return config;
}

export default SiteConfigModel;
