# User Service

Production-ready User & Authentication Microservice based on the supplied project document.

## Stack
- Node.js / TypeScript
- Express
- PostgreSQL
- Prisma
- Argon2
- JWT
- Zod
- Helmet
- CORS
- HTTP-only refresh-token cookie

## Database: Neon Postgres

This service uses [Neon](https://neon.tech) as its PostgreSQL provider via Prisma.

1. Create a Neon project and database at https://console.neon.tech.
2. From the Neon dashboard, copy two connection strings:
   - **Pooled connection** (has `-pooler` in the hostname) → set as `DATABASE_URL`. This is what the app uses at runtime.
   - **Direct connection** (no `-pooler`) → set as `DIRECT_URL`. Prisma Migrate uses this to run schema migrations, since migrations don't work reliably through the pooler.
3. Both URLs need `sslmode=require`; the pooled one also needs `pgbouncer=true` (see `.env.example`).
4. Copy `.env.example` to `.env` and fill in your Neon credentials.

## Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Default development port: 4001.

See `.env.example` for required environment variables.
