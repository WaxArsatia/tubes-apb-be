# tubes-apb-be

Backend API for the APB finance app.

## Overview

This service provides authentication, dashboard summary, and profile settings APIs. It exposes an OpenAPI spec and Swagger UI for testing.

## Features

- JWT authentication with access token + refresh token flow
- Refresh token rotation and token revocation on logout/password change
- Forgot password flow using 4-digit OTP
- Authenticated user profile endpoint
- Dashboard summary from user transaction data
- Profile update endpoint with multipart image upload (image only, max 10MB)
- Standard success/error envelope responses

## Tech Stack

- Bun + TypeScript
- Hono + @hono/zod-openapi + @hono/swagger-ui
- PostgreSQL
- Drizzle ORM + drizzle-kit
- bcryptjs, jsonwebtoken, nodemailer, zod

## Setup and Run

1. Install dependencies.

```sh
bun install
```

2. Copy environment template.

```sh
cp .env.example .env
```

3. Start PostgreSQL container.

```sh
docker compose up -d postgres
```

4. Apply database migrations.

```sh
bun run db:migrate
```

5. (Optional) Seed demo data.

```sh
bun run db:seed
```

6. Start development server.

```sh
bun run dev
```

Default local URLs:

- API: http://localhost:3000
- OpenAPI JSON: http://localhost:3000/doc
- Swagger UI: http://localhost:3000/ui

## Environment

From current code/config:

- Required: `DATABASE_URL`
- App config: `PORT`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `UPLOAD_DIR`, `PUBLIC_BASE_URL`
- JWT secrets: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (optional in dev; defaults exist)
- SMTP (for real OTP email delivery): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Docker Postgres vars: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

If SMTP is not fully configured, OTP is logged to server output instead of sent by email.

## Scripts

- `bun run dev` - run API in hot-reload mode
- `bun run lint` - lint source files
- `bun run db:generate` - generate SQL migration files from schema
- `bun run db:migrate` - run migrations
- `bun run db:seed` - seed sample user and transactions
- `bun run typecheck` - TypeScript type check

## API Endpoints

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh-token`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/verify-otp`
- `POST /auth/change-password` (forgot-password flow)
- `PATCH /auth/change-password` (authenticated flow)

Dashboard:

- `GET /dashboard`

Settings:

- `PATCH /settings/profile` (multipart/form-data)

Health:

- `GET /`

## Project Structure

```text
src/
	common/
		auth/
		config/
		errors/
		http/
		upload/
	db/
		client.ts
		migrate.ts
		schema.ts
		seed.ts
	modules/
		auth/
		dashboard/
		settings/
	routes/
		health.route.ts
		index.ts
	index.ts
drizzle/
docs/
docker-compose.yml
```

## Notes

- Seed user constants are defined in `src/db/seed.ts`.
- No test suite is configured in `package.json`.
