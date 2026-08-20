import type { User as ProtoUser } from '@app/common/types/proto/auth';
import { PublicUser } from './interfaces/user.interface';

/**
 * Converts a Prisma `User` (without password) into the proto-generated `User`
 * shape returned over gRPC.
 *
 * - Accepts `Omit<PrismaUser, 'password'>` so callers can't accidentally rely
 *   on the mapper to strip credentials; the caller must have already removed
 *   `password` via Prisma's `omit` (or the field must never have been loaded).
 * - Converts `Date` fields into ISO strings to match the proto contract.
 */
export function toProtoUser(user: PublicUser): ProtoUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    roles: user.roles,
  };
}
