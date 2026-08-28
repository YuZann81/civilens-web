# Web Authentication Architecture (Next.js)

## 1. Overview

`civilens-web` integrates directly with Laravel Sanctum's first-party stateful SPA authentication.

```text
Browser (Next.js App Router)
   │
   │ 1. GET /api/cv/v1/auth/me (with credentials: "include")
   ▼
Laravel Sanctum (api.razzan.site)
   │
   │ 2. Validates HttpOnly session cookie against Redis session
   ▼
AuthContext / useAuth() (loading → authenticated / unauthenticated)
```

## 2. Authentication Source of Truth

* The server session accessed via `GET /api/cv/v1/auth/me` is the sole source of truth.
* Zero tokens are stored in browser-accessible storage (`localStorage`, `sessionStorage`, `IndexedDB`).
* No JWT tokens or credentials exist on the client.

## 3. Google OAuth Integration Flow

1. User clicks **Continue with Google**.
2. Browser initiates a direct full-page navigation to `${API_BASE_URL}/auth/google/redirect`.
3. Google handles consent and redirects to Laravel's callback (`/auth/google/callback`).
4. Laravel establishes the Sanctum session and redirects back to `civilens.razzan.site`.
5. On reload, `AuthProvider` calls `getAuthUser()` and transitions to `authenticated`.

## 4. Logout Lifecycle

1. `useAuth().logout()` executes `initCsrf()` to ensure valid CSRF cookies.
2. Dispatches `POST /api/cv/v1/auth/logout` to the backend.
3. Laravel invalidates the Redis session, clears authentication guards, and regenerates tokens.
4. Client updates state to `unauthenticated` (`user = null`).

## 5. Protected Routes

The `<ProtectedRoute>` component guards sensitive pages:
* **Loading:** Displays accessible loading state while the initial `/auth/me` check is in-flight.
* **Unauthenticated:** Redirects to `/` (auth entry).
* **Role Mismatch:** Renders unauthorized alert if `requiredRole` does not match `$user.role`.

*Security Note:* Frontend role checks are for UX only; backend policies remain the final authorization authority.
