import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: "postgresql://neondb_owner:npg_LzHwVc9J8mKe@ep-square-base-ah1qoowf.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
  }
});