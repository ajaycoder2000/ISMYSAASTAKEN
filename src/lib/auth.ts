import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SessionPayload, UserRole, PlanType } from '@/types';
import dbConnect from './mongodb';
import User, { IUser } from '@/models/User';
import MagicToken from '@/models/MagicToken';
import { DevStore } from './dev-store';

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-in-production-please';
const COOKIE_NAME = 'saastakenSession';
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
const MAGIC_LINK_DURATION = 15 * 60; // 15 minutes in seconds

function getSecret(): string {
  return SESSION_SECRET;
}

export async function createSession(
  userId: string,
  email: string,
  plan: string,
  role: UserRole = 'user'
): Promise<void> {
  const token = jwt.sign(
    { userId, email, plan, role } as SessionPayload,
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
      
      let plan: PlanType = 'free';
      let role: UserRole = 'user';

      try {
        const conn = await dbConnect();
        if (conn) {
          let userDoc = await User.findOne({ clerkId: userId });
          if (!userDoc) {
            userDoc = await User.findOne({ email });
          }
          if (!userDoc) {
            const userCount = await User.countDocuments();
            userDoc = await User.create({
              clerkId: userId,
              email,
              role: userCount === 0 ? 'admin' : 'user',
            });
          }
          if (userDoc) {
            plan = userDoc.plan;
            role = userDoc.role || 'user';
          }
        }
      } catch {
        // fallback
      }

      let devUser = DevStore.findUserByEmail(email);
      if (!devUser) {
        const isFirst = DevStore.getAllUsers().length === 0;
        devUser = DevStore.createUser(email, isFirst ? 'admin' : 'user');
      }
      if (devUser) {
        plan = devUser.plan;
        role = devUser.role;
      }

      return {
        userId,
        email,
        plan,
        role,
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
  if (!session?.userId) return null;

  try {
    const conn = await dbConnect();
    if (conn) {
      const user = await User.findOne({
        $or: [{ _id: session.userId }, { clerkId: session.userId }, { email: session.email }],
      });
      if (!user || user.role !== 'admin' || user.suspended) {
        return null;
      }
      return user;
    }
  } catch {
    // Fall back to DevStore
  }

  const devUser = DevStore.findUserById(session.userId) || DevStore.findUserByEmail(session.email);
  if (!devUser || devUser.role !== 'admin' || devUser.suspended) {
    return null;
  }
  return devUser;
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
      if (!user) {
        const userCount = await User.countDocuments();
        user = await User.create({
          email: magicToken.email,
          role: userCount === 0 ? 'admin' : 'user',
        });
      }

      await magicToken.deleteOne();

      return {
        userId: user._id.toString(),
        email: user.email,
        plan: user.plan,
        role: user.role || 'user',
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
    role: result.user.role,
  };
}
