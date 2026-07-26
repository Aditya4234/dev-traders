const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = "mongodb+srv://adityadeveloper10x_db_user:A6ZAA5VXuP7HIsNp@cluster0.y9pnvta.mongodb.net/riya_touch";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  phone: String,
  role: { type: String, enum: ["customer", "admin", "dealer"], default: "customer" },
  companyName: String,
  dealerId: { type: String, unique: true, sparse: true },
  permissions: { type: [String], default: [] },
  lastLoginAt: Date,
  loginCount: { type: Number, default: 0 },
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: "riyatouch@gmail.com" });
  if (existing) {
    existing.role = "admin";
    existing.companyName = "Riya Touch";
    existing.dealerId = "RT-ADMIN";
    existing.password = "riya1234";
    existing.markModified("password");
    await existing.save();
    console.log("Existing user updated to admin:", existing.email);
  } else {
    const user = await User.create({
      name: "Riya Touch Admin",
      email: "riyatouch@gmail.com",
      password: "riya1234",
      role: "admin",
      companyName: "Riya Touch",
      dealerId: "RT-ADMIN",
      lastLoginAt: new Date(),
      loginCount: 0,
    });
    console.log("Admin user created:", user.email);
  }

  await mongoose.disconnect();
  console.log("Done!");
}

seed().catch((err) => { console.error(err); process.exit(1); });
