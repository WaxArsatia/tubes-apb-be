# Auth, Dashboard, and Settings Backend Design

Date: 2026-04-12
Status: Approved for implementation after user review
Scope: Replace existing template user implementation with production-oriented modular backend for `/auth`, `/dashboard`, and `/settings` based on API SPEC.

## 1. Goals and Constraints

### Goals

- Implement API contract in `docs/API SPEC.md` end to end.
- Remove existing template user endpoint and related placeholder model/service/schema/controller.
- Use modular domain-first architecture.
- Use PostgreSQL + Drizzle ORM with migrations and seeding.
- Provide strict response envelopes on all endpoints.
- Provide working local infrastructure via Docker Compose.
- Support Flutter mobile client requirements for token lifetime and refresh flow.

### Confirmed constraints

- Access token lifetime: `30d`.
- Refresh token lifetime: `90d`.
- Refresh token transport: request body.
- OTP channel: SMTP email.
- OTP policy: 4 digits, valid 30 minutes.
- OTP abuse throttling: not implemented in this phase.
- Profile picture storage: local filesystem.
- Password validation: minimum 8 characters.
- Upload max size: 10MB.
- Tests: out of scope for this phase.

## 2. Module and Folder Architecture

The application will be organized into domain modules with shared common infrastructure.

```text
src/
  index.ts
  routes/
    index.ts
    health.route.ts

  common/
    config/
      env.ts
    errors/
      app-error.ts
      error-handler.ts
    http/
      envelope.ts
      responses.ts
    auth/
      auth-middleware.ts
      jwt.ts
      password.ts
      token.ts
    upload/
      upload.ts

  db/
    client.ts
    schema.ts
    migrate.ts
    seed.ts

  modules/
    auth/
      auth.schema.ts
      auth.repository.ts
      auth.service.ts
      auth.controller.ts
      auth.route.ts
    dashboard/
      dashboard.schema.ts
      dashboard.repository.ts
      dashboard.service.ts
      dashboard.controller.ts
      dashboard.route.ts
    settings/
      settings.schema.ts
      settings.repository.ts
      settings.service.ts
      settings.controller.ts
      settings.route.ts
```

### Layer responsibilities

- Route: OpenAPI contracts and endpoint registration.
- Controller: Request extraction and HTTP status/result mapping.
- Service: Domain rules and orchestration.
- Repository: Drizzle query operations.
- Common: cross-cutting concerns (auth, envelope, errors, config, upload).

## 3. Data Model (PostgreSQL + Drizzle)

## 3.1 users

- `id` UUID primary key default random.
- `first_name` text not null.
- `last_name` text not null.
- `email` text not null unique.
- `password_hash` text not null.
- `profile_picture` text nullable.
- `created_at` timestamp not null default now.
- `updated_at` timestamp not null default now.

## 3.2 refresh_tokens

- `id` UUID primary key default random.
- `user_id` UUID not null references users.id on delete cascade.
- `token_hash` text not null unique.
- `expires_at` timestamp not null.
- `revoked_at` timestamp nullable.
- `replaced_by_token_id` UUID nullable references refresh_tokens.id.
- `created_at` timestamp not null default now.

## 3.3 password_reset_otps

- `id` UUID primary key default random.
- `user_id` UUID not null references users.id on delete cascade.
- `email` text not null.
- `otp_hash` text not null.
- `expires_at` timestamp not null.
- `verified_at` timestamp nullable.
- `created_at` timestamp not null default now.

## 3.4 transactions

- `id` UUID primary key default random.
- `user_id` UUID not null references users.id on delete cascade.
- `name` text not null.
- `timestamp` timestamp not null.
- `kind` enum (`Income`, `Expense`) not null.
- `amount` integer not null.
- `created_at` timestamp not null default now.

## 3.5 Indexes

- Unique index on `users.email`.
- Index on `refresh_tokens.user_id`.
- Index on `password_reset_otps.user_id`.
- Composite index on `transactions(user_id, timestamp desc)`.

## 4. Response Envelope Contract

All endpoints return one of two envelopes.

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": ["Error message"]
  }
}
```

### Error mapping strategy

- Validation errors: `400` or `422` based on route contract.
- Unauthorized access/token failure: `401`.
- Not found: `404`.
- Conflict (duplicate email): `409`.
- Payload too large: `413`.
- Unsupported media type: `415`.
- Unexpected errors: `500`.

## 5. Auth Flow Design

## 5.1 Register (`POST /auth/register`)

- Validate required fields and email format.
- Enforce `password.length >= 8` and password confirmation match.
- Reject existing email with `409`.
- Hash password with bcrypt and insert user.
- Return `201` + `{ registered: true }`.

## 5.2 Login (`POST /auth/login`)

- Validate credentials payload.
- Compare password hash.
- Create access JWT (`30d`) and refresh token (`90d`).
- Store refresh token hash and expiry.
- Return token bundle and `expiresIn`.

## 5.3 Refresh Token (`POST /auth/refresh-token`)

- Validate refresh token from request body.
- Verify signature and DB token state (not revoked/expired).
- Rotate token:
  - mark current token revoked,
  - create replacement token row,
  - return new access + refresh tokens.

## 5.4 Logout (`POST /auth/logout`)

- Validate refresh token.
- Revoke token row if active.
- Return `{ loggedOut: true }`.

## 5.5 Me (`GET /auth/me`)

- Validate bearer access token.
- Load current user by token subject.
- Return profile payload.

## 5.6 Forgot Password (`POST /auth/forgot-password`)

- Validate email and ensure account exists.
- Generate numeric 4-digit OTP.
- Hash OTP and persist with 30-minute expiry.
- Send OTP via SMTP provider.
- Return `{ email, otpExpiresInMinutes: 30 }`.

## 5.7 Verify OTP (`POST /auth/verify-otp`)

- Validate email + OTP (4 digits).
- Compare against latest active OTP record and expiry.
- Mark OTP record as verified.
- Return `{ email, otpVerified: true }`.

## 5.8 Change Password forgot flow (`POST /auth/change-password`)

- Validate email + otp + newPassword + confirmationPassword.
- Require password confirmation match and minimum length 8.
- Validate OTP active and unexpired.
- Update user password hash.
- Invalidate/consume OTP.
- Return `{ passwordChanged: true }`.

## 5.9 Change Password authenticated (`PATCH /auth/change-password`)

- Require valid access token.
- Validate old/new/confirmation fields.
- Verify old password hash.
- Update password hash.
- Return `{ passwordChanged: true }`.

## 6. Dashboard Flow Design

## 6.1 Dashboard summary (`GET /dashboard`)

- Require valid access token.
- Query transactions for authenticated user.
- Compute:
  - `income` = sum of `Income`.
  - `expense` = sum of `Expense`.
  - `totalBalance = income - expense`.
  - `budgetRemaining = totalBalance` (until a dedicated budget model exists).
- Query recent transactions ordered by timestamp desc.
- Return payload with firstName/profilePicture plus computed fields.

## 7. Settings Flow Design

## 7.1 Update profile (`PATCH /settings/profile`)

- Require valid access token.
- Accept `multipart/form-data` with optional `firstName`, `lastName`, `profilePicture`.
- Validate file MIME starts with image type.
- Enforce max upload size 10MB.
- Save file to local upload directory.
- Persist profile URL and/or names.
- Return `{ updated: true, updatedAt }`.

## 8. Security and Auth Design

- Access and refresh secrets configured from env.
- JWT payload includes `sub` (user id) and token type.
- Refresh token rows store hash, not raw token.
- Password hashing with bcrypt.
- OTP storage as hashed value.
- No brute-force limiter in this phase by explicit product decision.

## 9. Infra and Runtime Design

## 9.1 Dependencies

- Runtime: `drizzle-orm`, `postgres`, `jsonwebtoken`, `bcryptjs`, `nodemailer`, `dotenv`.
- Dev: `drizzle-kit`.

## 9.2 Environment variables

- `DATABASE_URL`
- `PORT`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN` (default `30d`)
- `REFRESH_TOKEN_EXPIRES_IN` (default `90d`)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `UPLOAD_DIR`
- `PUBLIC_BASE_URL`

## 9.3 Docker Compose

- Add PostgreSQL service with persistent volume and healthcheck.
- Expose DB port for local access.

## 9.4 Scripts

- `dev`
- `db:generate`
- `db:migrate`
- `db:seed`
- `typecheck`

## 10. Seeding Strategy

- Insert one demo user with known credentials for development.
- Insert sample mixed transactions for dashboard endpoint.
- Seed should be idempotent enough for repeated local bootstrap.

## 11. Out of Scope

- Automated test suite.
- Cloud object storage.
- OTP rate limiting and abuse lockout.

## 12. Implementation Sequence

1. Install dependencies and setup env/config scaffolding.
2. Build DB schema, migration tooling, and seed script.
3. Implement common envelope/error/auth/upload utilities.
4. Implement auth module endpoints and wiring.
5. Implement dashboard module endpoint and wiring.
6. Implement settings module endpoint and wiring.
7. Remove template user modules and route registration.
8. Update OpenAPI registration and ensure all routes documented.
9. Run typecheck and runtime smoke validation.

## 13. Acceptance Criteria

- Existing template user endpoint no longer exists.
- All specified endpoints are available and documented in OpenAPI.
- All endpoint responses follow strict envelope format.
- Auth flows function with token rotation and me/profile support.
- Dashboard returns computed real data from database rows.
- Settings update accepts multipart and stores image locally.
- App runs locally with Docker PostgreSQL + migration + seed scripts.
