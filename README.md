# tubes-apb-be

Backend service for Tubes Aplikasi Perangkat Bergerak (APB) - a mobile app for managing personal finances.

Built with:

- Bun
- Hono + Zod OpenAPI
- PostgreSQL
- Drizzle ORM

## Features

- JWT auth with access token and refresh token rotation
- Forgot-password OTP flow via email (4-digit OTP)
- Authenticated profile endpoint (`/auth/me`)
- Dashboard summary from real transactions data
- Profile update with multipart image upload
- OpenAPI docs and Swagger UI
- Standard response envelope for success and error responses

## Prerequisites

- Bun (latest stable)
- Docker and Docker Compose
- PostgreSQL runs from Docker Compose in local development

## Quick Start

1. Install dependencies:

```sh
bun install
```

2. Copy environment file:

```sh
cp .env.example .env
```

3. Start PostgreSQL:

```sh
docker compose up -d postgres
```

4. Generate migration (first time or after schema changes):

```sh
bun run db:generate
```

5. Apply migration:

```sh
bun run db:migrate
```

6. Seed demo data:

```sh
bun run db:seed
```

7. Start the server:

```sh
bun run dev
```

Server URL:

- http://localhost:3000

## API Docs

- OpenAPI JSON: http://localhost:3000/doc
- Swagger UI: http://localhost:3000/ui

## Response Format

Success envelope:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error envelope:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field": ["message"]
  }
}
```

## Environment Variables

Configured in `.env`.

Required:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Common app config:

- `PORT` (default: `3000`)
- `ACCESS_TOKEN_EXPIRES_IN` (default: `30d`)
- `REFRESH_TOKEN_EXPIRES_IN` (default: `90d`)
- `UPLOAD_DIR` (default: `uploads`)
- `PUBLIC_BASE_URL` (default: `http://localhost:<PORT>`)

SMTP config for OTP email:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Postgres container config:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

See `.env.example` for full template values.

## Scripts

- `bun run dev` - start development server with hot reload
- `bun run db:generate` - generate SQL migration from Drizzle schema
- `bun run db:migrate` - apply migrations
- `bun run db:seed` - seed demo data
- `bun run typecheck` - run TypeScript checks

Lint (without script):

```sh
bunx eslint .
```

## Seeded Demo Account

- Email: `demo@example.com`
- Password: `password123`

## Endpoint Overview

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

- `PATCH /settings/profile` (`multipart/form-data`)

Health:

- `GET /`

## Uploads

- Profile images are stored on local filesystem under `UPLOAD_DIR`
- Static files are served from `/<UPLOAD_DIR>/...`
- Max upload size: 10MB
- Allowed file type category: `image/*`

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
```

## Notes

- This phase does not include automated tests yet.
- If SMTP is not configured, OTP sending is logged for local development.
