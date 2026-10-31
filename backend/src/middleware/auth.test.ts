import assert from 'node:assert/strict';
import test from 'node:test';
import type { NextFunction, Request, Response } from 'express';
import { requireAuth, requireRole } from './auth.js';

async function authenticate(authorization?: string) {
  const req = { headers: authorization ? { authorization } : {} } as Request;
  let nextError: unknown;
  await requireAuth(req, {} as Response, ((error?: unknown) => {
    nextError = error;
  }) as NextFunction);
  return { req, nextError };
}

test('authentication rejects missing and invalid bearer tokens', async () => {
  const missing = await authenticate();
  assert.equal((missing.nextError as { status: number }).status, 401);

  const invalid = await authenticate('Bearer not-a-firebase-id-token');
  assert.equal((invalid.nextError as { status: number }).status, 401);
});

test('admin role guard denies family users and permits trusted admin claims', () => {
  let familyError: unknown;
  requireRole('admin')(
    { user: { uid: 'family-user', role: 'family' } } as Request,
    {} as Response,
    ((error?: unknown) => {
      familyError = error;
    }) as NextFunction,
  );
  assert.equal((familyError as { status: number }).status, 403);

  let adminError: unknown = new Error('next was not called');
  requireRole('admin')(
    { user: { uid: 'trusted-admin', role: 'admin' } } as Request,
    {} as Response,
    ((error?: unknown) => {
      adminError = error;
    }) as NextFunction,
  );
  assert.equal(adminError, undefined);
});
