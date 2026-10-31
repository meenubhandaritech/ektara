import type { NextFunction, Request, Response } from 'express';
import { isDemo } from '../config/env.js';
import { verifyFirebaseIdToken } from '../services/firebase/auth.service.js';
import { forbidden, unauthorized } from '../utils/errors.js';

export type Role = 'family' | 'user' | 'editor' | 'admin';
export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Synthetic demo identities. Only honoured when the server is in DEMO MODE.
const DEMO_USERS: Record<string, AuthUser> = {
  'demo-user': { uid: 'demo-user', email: 'demo.user@example.invalid', role: 'user' },
  'demo-admin': { uid: 'demo-admin', email: 'demo.admin@example.invalid', role: 'admin' },
};

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw unauthorized();

    if (isDemo) {
      const u = DEMO_USERS[token];
      if (!u) throw unauthorized('Invalid demo session');
      req.user = u;
      return next();
    }

    const decoded = await verifyFirebaseIdToken(token);
    const role = (
      ['admin', 'editor', 'family', 'user'].includes(decoded.role as string) ? decoded.role : 'family'
    ) as Role;
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      displayName: typeof decoded.name === 'string' ? decoded.name : undefined,
      photoURL: typeof decoded.picture === 'string' ? decoded.picture : undefined,
      role,
    };
    next();
  } catch (e: any) {
    next(e?.status ? e : unauthorized('Invalid or expired session'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return next(forbidden());
    next();
  };
}
