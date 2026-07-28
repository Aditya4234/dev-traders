import crypto from "crypto";
import { Router, Request, Response } from "express";
import User from "../models/User";
import { generateToken, protect, AuthRequest } from "../middleware/auth";

const router = Router();

function sanitizeUser(user: any) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    profileImage: user.profileImage || null,
    companyName: user.companyName || null,
    dealerId: user.dealerId || null,
    permissions: user.permissions || [],
    lastLoginAt: user.lastLoginAt || null,
    loginCount: user.loginCount || 0,
  };
}

// POST /api/auth/google
router.post("/google", async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ success: false, message: "Google credential is required" });
      return;
    }

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    const tokenData: any = await response.json();

    if (tokenData.error_description || tokenData.error) {
      res.status(401).json({ success: false, message: "Invalid Google token" });
      return;
    }

    const { email, name, picture } = tokenData;

    if (!email) {
      res.status(401).json({ success: false, message: "Could not extract email from Google token" });
      return;
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        password: Math.random().toString(36).slice(-16) + "A1!",
        profileImage: picture || undefined,
        lastLoginAt: new Date(),
        loginCount: 1,
      });
    } else {
      if (picture && !user.profileImage) {
        user.profileImage = picture;
      }
      user.lastLoginAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, companyName, dealerId } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Name, email and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: "Email already registered" });
      return;
    }

    // Only allow customer or dealer roles via public registration
    const userRole = role === "dealer" ? "dealer" : "customer";

    const userData: any = {
      name,
      email,
      password,
      phone,
      role: userRole,
      lastLoginAt: new Date(),
      loginCount: 1,
    };

    if (userRole === "dealer") {
      if (companyName) userData.companyName = companyName;
      if (dealerId) userData.dealerId = dealerId;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.json({ success: true, message: "If the email exists, a reset link has been sent" });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    (user as any).resetPasswordToken = resetToken;
    (user as any).resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // TODO: Send resetToken via email in production
    // For now, log it for development purposes only
    console.log("Password reset token for:", email, "token:", resetToken);

    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ success: false, message: "Token and password are required" });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      res.status(400).json({ success: false, message: "Invalid or expired reset token" });
      return;
    }

    user.password = password;
    (user as any).resetPasswordToken = undefined;
    (user as any).resetPasswordExpiry = undefined;
    await user.save();

    const newToken = generateToken(user._id.toString());
    res.json({
      success: true,
      message: "Password reset successful",
      token: newToken,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/profile
router.put("/profile", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, companyName, dealerId, preferences } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (companyName) user.companyName = companyName;
    if (dealerId) user.dealerId = dealerId;
    if (preferences) {
      if (!user.preferences) user.preferences = { notifications: true, emailUpdates: true };
      if (typeof preferences.notifications === 'boolean') user.preferences.notifications = preferences.notifications;
      if (typeof preferences.emailUpdates === 'boolean') user.preferences.emailUpdates = preferences.emailUpdates;
    }
    await user.save();

    res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Current and new password are required" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
      return;
    }

    const user = await User.findById(req.user?.id).select("+password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Current password is incorrect" });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
