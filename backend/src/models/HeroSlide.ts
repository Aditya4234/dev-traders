import mongoose, { Schema, Document } from "mongoose";

export interface IHeroSlide extends Document {
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  accent?: string;
  sortOrder: number;
  isActive: boolean;
}

const heroSlideSchema = new Schema<IHeroSlide>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    cta: { type: String, required: true },
    image: { type: String, required: true },
    accent: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IHeroSlide>("HeroSlide", heroSlideSchema);
