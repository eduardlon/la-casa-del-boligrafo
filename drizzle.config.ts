import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || "libsql://boligrafo-eduardlon.aws-us-east-1.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI2NjUwNDYsImlkIjoiMDE5Y2JiMTEtZDkwMS03OTI0LThiOTctYmU0MzRjYjVhM2ExIiwicmlkIjoiNGFjNjM3YWQtMmVkZC00MjFjLTlkNzAtM2RhNzI4ZmM3ZmEwIn0.PB_EHQM7nV3dNN7RYO5w667Ucdbw-dwJ5yMt748dxLv8kZfcxJM6pCX_tdH3YROf9xy9x4_r_x0d30GEpxjjBg",
  },
});
