import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SessionPayload, UserRole, PlanType } from '@/types';
import dbConnect from './mongodb';
import User, { IUser } from '@/models/User';
import MagicToken from '@/models/MagicToken';
import { DevStore } from './dev-store';
import { SupabaseDB } from './supabase/db';

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-in-production-please';
const COOKIE_NAME = 'saastakenSession';
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
const MAGIC_LINK_DURATION = 15 * 60; // 15 minutes in seconds

function getSecret(): string {
  return SESSION_SECRET;
}

/**
 * Checks whether an email is an authorized admin email.
 * Configured via ADMIN_EMAIL env var (defaults to ismysaastaken@gmail.com).
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const adminEnv = (process.env.ADMIN_EMAIL || 'ismysaastaken@gmail.com').toLowerCase();
  const allowed = adminEnv.split(',').map((e) => e.trim()).filter(Boolean);
  return allowed.includes(clean);
}

export async function createSession(
  userId: string,
  email: string,
  plan: string,
  role?: UserRole
): Promise<void> {
  const actualRole: UserRole = role || (isAdminEmail(email) ? 'admin' : 'user');
  const token = jwt.sign(
    { userId, email, plan, role: actualRole } as SessionPayload,
    getSecret(),
    { expiresIn: SESSION_DURATION }
  );

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  // 1. Check Clerk Authenticated Session First
  try {
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress || `${userId}@user.clerk`;
      
      const synced = await SupabaseDB.syncUser(userId, email);
      const isAuthorizedAdmin = isAdminEmail(email) || synced.role === 'admin';

      return {
        userId,
        email: synced.email,
        plan: synced.plan,
        role: isAuthorizedAdmin ? 'admin' : 'user',
      };
    }
  } catch {
    // Continue to legacy session fallback
  }

  // 2. Fall back to JWT cookie session
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, getSecret()) as SessionPayload;
    if (decoded?.email) {
      decoded.role = isAdminEmail(decoded.email) || decoded.role === 'admin' ? 'admin' : 'user';
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Strictly verifies admin role on the server.
 */
export async function getAdminUser(): Promise<IUser | { _id: string; email: string; role: UserRole; suspended: boolean } | null> {
  const session = await getSession();
  if (!session?.userId || !session?.email) return null;

  // Strict email-based or explicit admin verification
  if (isAdminEmail(session.email) || session.role === 'admin') {
    return {
      _id: session.userId,
      email: session.email,
      role: 'admin',
      suspended: false,
    };
  }

  try {
    const conn = await dbConnect();
    if (conn) {
      const user = await User.findOne({
        $or: [{ _id: session.userId }, { clerkId: session.userId }, { email: session.email }],
      });
      if (user && (user.role === 'admin' || isAdminEmail(user.email)) && !user.suspended) {
        return user;
      }
      return null;
    }
  } catch {
    // Fall back to DevStore
  }

  const devUser = DevStore.findUserById(session.userId) || DevStore.findUserByEmail(session.email);
  if (devUser && (devUser.role === 'admin' || isAdminEmail(devUser.email)) && !devUser.suspended) {
    return devUser;
  }
  return null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function generateMagicToken(email: string): Promise<string> {
  const cleanEmail = email.toLowerCase().trim();

  try {
    const conn = await dbConnect();
    if (conn) {
      await MagicToken.deleteMany({ email: cleanEmail });
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + MAGIC_LINK_DURATION * 1000);
      await MagicToken.create({ email: cleanEmail, token, expiresAt });
      return token;
    }
  } catch (error) {
    console.warn('MongoDB token creation failed, using DevStore:', error);
  }

  return DevStore.createMagicToken(cleanEmail);
}

export async function verifyMagicToken(token: string): Promise<{ userId: string; email: string; plan: string; role: UserRole } | null> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const magicToken = await MagicToken.findOne({ token });
      if (!magicToken || magicToken.expiresAt < new Date()) {
        if (magicToken) await magicToken.deleteOne();
        return null;
      }

      let user = await User.findOne({ email: magicToken.email });
      const role: UserRole = isAdminEmail(magicToken.email) ? 'admin' : 'user';
      if (!user) {
        user = await User.create({
          email: magicToken.email,
          role,
        });
      }

      await magicToken.deleteOne();

      return {
        userId: user._id.toString(),
        email: user.email,
        plan: user.plan,
        role: isAdminEmail(user.email) ? 'admin' : (user.role || 'user'),
      };
    }
  } catch (error) {
    console.warn('MongoDB token verify failed, checking DevStore:', error);
  }

  const result = DevStore.verifyMagicToken(token);
  if (!result) return null;

  return {
    userId: result.user._id,
    email: result.user.email,
    plan: result.user.plan,
    role: isAdminEmail(result.user.email) ? 'admin' : result.user.role,
  };
}
