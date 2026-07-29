import jwt from "jsonwebtoken";
import User from "@/lib/models/User";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  profileImage?: string;
  companyName?: string;
  dealerId?: string;
  permissions?: string[];
}

export function getTokenFromHeader(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.split(" ")[1];
}

export async function protect(request: Request): Promise<AuthUser> {
  const token = getTokenFromHeader(request);
  if (!token) {
    throw Object.assign(new Error("Not authorized"), { status: 401 });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 401 });
    }
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      companyName: user.companyName,
      dealerId: user.dealerId,
      permissions: user.permissions,
    };
  } catch (err: any) {
    if (err.status) throw err;
    throw Object.assign(new Error("Invalid token"), { status: 401 });
  }
}

export async function optionalAuth(request: Request): Promise<AuthUser | null> {
  const token = getTokenFromHeader(request);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      companyName: user.companyName,
      dealerId: user.dealerId,
      permissions: user.permissions,
    };
  } catch {
    return null;
  }
}

export function adminOnly(user: AuthUser): void {
  if (user.role !== "admin") {
    throw Object.assign(new Error("Admin access only"), { status: 403 });
  }
}

export function wholesellerOnly(user: AuthUser): void {
  if (user.role !== "admin" && user.role !== "dealer") {
    throw Object.assign(new Error("Wholeseller access only"), { status: 403 });
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRE || "7d") as any,
  } as any);
}
