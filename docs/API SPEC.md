# API Specification

This document defines the API contract for the Authentication, Dashboard, and Settings modules.

## General Conventions

### A. Success Response Envelope

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### B. Error Response Envelope

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": ["Error message"]
  }
}
```

### C. Authentication

- Authentication model: JWT access token + refresh token.
- Primary client: Flutter mobile app.
- Refresh token transport: request body.
- `GET /auth/me` is the canonical endpoint for current user identity and profile data.
- Endpoints that require authentication must include:

| Header        | Value                  |
| :------------ | :--------------------- |
| Authorization | Bearer `<accessToken>` |

### D. OTP Policy

- OTP delivery channel: email.
- OTP validity: 30 minutes.
- OTP format: 4 digits.
- To resend OTP, call `POST /auth/forgot-password` again.

---

## 1. Authentication (`/auth`)

### 1.1. Register

Creates a new user account.

- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Auth:** Not required

**Request Body**

| Field                  | Type     | Description                            |
| :--------------------- | :------- | :------------------------------------- |
| `firstName`            | `String` | Required                               |
| `lastName`             | `String` | Required                               |
| `email`                | `String` | Required, must be a unique valid email |
| `password`             | `String` | Required                               |
| `confirmationPassword` | `String` | Required, must match `password`        |

**Response Data (201)**

| Field        | Type      | Description            |
| :----------- | :-------- | :--------------------- |
| `registered` | `Boolean` | Constant value: `true` |

**Status Codes**

- `201` Created
- `400` Bad Request
- `409` Conflict (email already registered)
- `422` Unprocessable Entity
- `500` Internal Server Error

### 1.2. Login

Authenticates a user and returns session tokens.

- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Auth:** Not required

**Request Body**

| Field      | Type     | Description                  |
| :--------- | :------- | :--------------------------- |
| `email`    | `String` | Required, valid email format |
| `password` | `String` | Required                     |

**Response Data (200)**

| Field          | Type      | Description                      |
| :------------- | :-------- | :------------------------------- |
| `accessToken`  | `String`  | JWT access token                 |
| `refreshToken` | `String`  | Refresh token                    |
| `tokenType`    | `String`  | Constant value: `Bearer`         |
| `expiresIn`    | `Integer` | Access token lifetime in seconds |

**Status Codes**

- `200` OK
- `400` Bad Request
- `401` Unauthorized (invalid credentials)
- `422` Unprocessable Entity
- `500` Internal Server Error

### 1.3. Refresh Token

Issues a new access token using a valid refresh token.

- **Method:** `POST`
- **Endpoint:** `/auth/refresh-token`
- **Auth:** Not required

**Request Body**

| Field          | Type     | Description |
| :------------- | :------- | :---------- |
| `refreshToken` | `String` | Required    |

**Response Data (200)**

| Field          | Type      | Description                      |
| :------------- | :-------- | :------------------------------- |
| `accessToken`  | `String`  | New JWT access token             |
| `refreshToken` | `String`  | New refresh token (rotation)     |
| `tokenType`    | `String`  | Constant value: `Bearer`         |
| `expiresIn`    | `Integer` | Access token lifetime in seconds |

**Status Codes**

- `200` OK
- `400` Bad Request
- `401` Unauthorized (invalid or expired refresh token)
- `500` Internal Server Error

### 1.4. Logout

Ends a user session by revoking the refresh token.

- **Method:** `POST`
- **Endpoint:** `/auth/logout`
- **Auth:** Not required

**Request Body**

| Field          | Type     | Description |
| :------------- | :------- | :---------- |
| `refreshToken` | `String` | Required    |

**Response Data (200)**

| Field       | Type      | Description   |
| :---------- | :-------- | :------------ |
| `loggedOut` | `Boolean` | Logout status |

**Status Codes**

- `200` OK
- `400` Bad Request
- `401` Unauthorized (invalid refresh token)
- `500` Internal Server Error

### 1.5. Get Current User (`me`)

Returns profile data for the currently authenticated user.

- **Method:** `GET`
- **Endpoint:** `/auth/me`
- **Auth:** Required

**Response Data (200)**

| Field            | Type             | Description         |
| :--------------- | :--------------- | :------------------ |
| `id`             | `String`         | User ID             |
| `firstName`      | `String`         | First name          |
| `lastName`       | `String`         | Last name           |
| `email`          | `String`         | Email               |
| `profilePicture` | `String \| null` | Profile picture URL |

**Status Codes**

- `200` OK
- `401` Unauthorized
- `500` Internal Server Error

### 1.6. Forgot Password

Requests an OTP for password reset. To resend OTP, call this endpoint again.

- **Method:** `POST`
- **Endpoint:** `/auth/forgot-password`
- **Auth:** Not required

**Request Body**

| Field   | Type     | Description                  |
| :------ | :------- | :--------------------------- |
| `email` | `String` | Required, valid email format |

**Response Data (200)**

| Field                 | Type      | Description          |
| :-------------------- | :-------- | :------------------- |
| `email`               | `String`  | OTP target email     |
| `otpExpiresInMinutes` | `Integer` | Constant value: `30` |

**Status Codes**

- `200` OK
- `400` Bad Request
- `404` Not Found (email not registered)
- `429` Too Many Requests
- `500` Internal Server Error

### 1.7. Verify OTP

Validates the OTP for the password reset flow.

- **Method:** `POST`
- **Endpoint:** `/auth/verify-otp`
- **Auth:** Not required

**Request Body**

| Field   | Type      | Description                  |
| :------ | :-------- | :--------------------------- |
| `email` | `String`  | Required, valid email format |
| `otp`   | `Integer` | Required, 4 digits           |

**Response Data (200)**

| Field         | Type      | Description            |
| :------------ | :-------- | :--------------------- |
| `email`       | `String`  | Verified email         |
| `otpVerified` | `Boolean` | Constant value: `true` |

**Status Codes**

- `200` OK
- `400` Bad Request
- `401` Unauthorized (invalid or expired OTP)
- `404` Not Found (email not found)
- `500` Internal Server Error

### 1.8. Change Password (Forgot Flow)

Sets a new password after OTP verification using `email + otp`.

- **Method:** `POST`
- **Endpoint:** `/auth/change-password`
- **Auth:** Not required

**Request Body**

| Field                  | Type      | Description                        |
| :--------------------- | :-------- | :--------------------------------- |
| `email`                | `String`  | Required, valid email format       |
| `otp`                  | `Integer` | Required, 4 digits                 |
| `newPassword`          | `String`  | Required                           |
| `confirmationPassword` | `String`  | Required, must match `newPassword` |

**Response Data (200)**

| Field             | Type      | Description            |
| :---------------- | :-------- | :--------------------- |
| `passwordChanged` | `Boolean` | Constant value: `true` |

**Status Codes**

- `200` OK
- `400` Bad Request
- `401` Unauthorized (invalid or expired OTP)
- `404` Not Found (email not registered)
- `422` Unprocessable Entity
- `500` Internal Server Error

### 1.9. Change Password (Logged-in User)

Updates password for an authenticated user.

- **Method:** `PATCH`
- **Endpoint:** `/auth/change-password`
- **Auth:** Required

**Request Body**

| Field                  | Type     | Description                        |
| :--------------------- | :------- | :--------------------------------- |
| `oldPassword`          | `String` | Required                           |
| `newPassword`          | `String` | Required                           |
| `confirmationPassword` | `String` | Required, must match `newPassword` |

**Response Data (200)**

| Field             | Type      | Description            |
| :---------------- | :-------- | :--------------------- |
| `passwordChanged` | `Boolean` | Constant value: `true` |

**Status Codes**

- `200` OK
- `400` Bad Request
- `401` Unauthorized
- `422` Unprocessable Entity
- `500` Internal Server Error

---

## 2. Dashboard (`/dashboard`)

### 2.1. Get Dashboard Data

Returns dashboard summary data for the authenticated user.

- **Method:** `GET`
- **Endpoint:** `/dashboard`
- **Auth:** Required

**Additional Types (TypeScript)**

```typescript
enum TransactionKind {
  Income = "Income",
  Expense = "Expense",
}

type RecentTransactionTypes = {
  name: string;
  timestamp: Date;
  kind: TransactionKind;
  amount: number;
};
```

**Response Data (200)**

| Field                | Type                            | Description           |
| :------------------- | :------------------------------ | :-------------------- |
| `firstName`          | `String`                        | User first name       |
| `profilePicture`     | `String \| null`                | Profile picture URL   |
| `totalBalance`       | `Integer`                       | Current total balance |
| `budgetRemaining`    | `Integer`                       | Remaining budget      |
| `income`             | `Integer`                       | Total income          |
| `expense`            | `Integer`                       | Total expense         |
| `recentTransactions` | `Array<RecentTransactionTypes>` | Recent transactions   |

**Status Codes**

- `200` OK
- `401` Unauthorized
- `500` Internal Server Error

---

## 3. Settings (`/settings`)

Use `GET /auth/me` to retrieve the current user profile.

### 3.1. Update Profile

Updates profile fields for the authenticated user.

- **Method:** `PATCH`
- **Endpoint:** `/settings/profile`
- **Auth:** Required
- **Content-Type:** `multipart/form-data`

**Request Body (Form Data)**

| Field            | Type     | Description         |
| :--------------- | :------- | :------------------ |
| `firstName`      | `String` | Optional            |
| `lastName`       | `String` | Optional            |
| `profilePicture` | `File`   | Optional image file |

**Response Data (200)**

| Field       | Type       | Description                   |
| :---------- | :--------- | :---------------------------- |
| `updated`   | `Boolean`  | Constant value: `true`        |
| `updatedAt` | `DateTime` | Profile last update timestamp |

**Status Codes**

- `200` OK
- `400` Bad Request
- `401` Unauthorized
- `413` Payload Too Large
- `415` Unsupported Media Type
- `422` Unprocessable Entity
- `500` Internal Server Error
