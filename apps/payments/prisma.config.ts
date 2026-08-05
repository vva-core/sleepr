// Payments' own env, loaded explicitly — never the root .env, which points at the
// shared `sleepr` database. Resolved against the CWD (not this file), which is safe
// because Prisma requires its commands to run from the project root.
//
// dotenv does not overwrite variables that are already set, so a `dotenv -e ...`
// flag at the call site still wins — that is how host-side migrations reach
// localhost instead of the `postgres` container hostname.
import { config } from 'dotenv';
config({ path: 'apps/payments/.env' });

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
