import { join } from 'path';
import { config } from 'dotenv';
config({ path: join(__dirname, '.env') });

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // TODO(human): decide how DATABASE_URL is resolved here.
    url: env('DATABASE_URL'),
  },
});
