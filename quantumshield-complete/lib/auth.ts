/**
 * Password hashing (bcryptjs — pure JS, no native compile step) and session
 * tokens (JWT stored in an httpOnly cookie).
 *
 * JWT_SECRET should be set in .env.local for anything beyond local demo use;
 * a dev fallback is provided so this runs out of the box.
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
export const COOKIE_NAME = "qs_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}
