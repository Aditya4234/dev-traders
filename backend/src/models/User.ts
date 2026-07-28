import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "customer" | "admin" | "dealer";
  profileImage?: string;
  companyName?: string;
  dealerId?: string;
  permissions: string[];
  lastLoginAt?: Date;
  loginCount: number;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String },
    role: { type: String, enum: ["customer", "admin", "dealer"], default: "customer" },
    profileImage: { type: String },
    companyName: { type: String },
    dealerId: { type: String, unique: true, sparse: true },
    permissions: { type: [String], default: [] },
    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },
    preferences: {
      notifications: { type: Boolean, default: true },
      emailUpdates: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
