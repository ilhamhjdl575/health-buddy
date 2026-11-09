# Health Buddy Authentication Infrastructure

## Overview
Step 18.1 prepares the base authentication utilities and session handlers for Supabase Auth.

- **Role Constraints**: Strictly `USER` and `BUDDY` (No ADMIN, no PROFESSIONAL).
- **Supported Providers**: `PHONE` (Phone OTP) and `GOOGLE` (Google OAuth).

## Utilities
- `getCurrentUser()`: Server-only helper reading authenticated user from Supabase. Returns `null` if unauthenticated. Never redirects.
- `getCurrentSession()`: Server-only helper returning a `SafeSession` object. Strips `access_token` and `refresh_token` to prevent token leakage to the UI.
- `getCurrentProfile()`: Server-only helper resolving authenticated user, profileId, and verified role from the database.
- `signOut()`: Server action to sign out from Supabase Auth and redirect to `/login`.
- `requireRole(allowedRole)`: Server-side route guard enforcing role-based access while allowing public routes and dev mock exploration.
- `signInWithGoogle()`: Initiates browser-side Google OAuth flow via Supabase Auth using PKCE.
- `normalizeThaiPhoneNumber()`: Normalizes 9-10 digit Thai numbers to E.164 format (+66...).
- `sendPhoneOtp()`: Dispatches an SMS OTP via Supabase Auth `signInWithOtp({ phone })`.
- `verifyPhoneOtp()`: Verifies the SMS token via Supabase Auth `verifyOtp({ phone, token, type: 'sms' })` and resolves post-login destination from database.
- `resolvePostLoginRedirect()`: Server action resolving `/signup`, `/user`, or `/buddy` based on verified database profile.
- `types.ts`: Re-exports strict `UserRole` and `AuthProvider` from `@/app/_lib/auth`.

## Google OAuth Flow (Step 18.5)
1. User clicks "เข้าสู่ระบบด้วย Google" on `/login`.
2. Browser initiates PKCE flow via `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })`.
3. User completes Google consent on Google accounts page.
4. Google redirects to Supabase's OAuth callback handler (`https://<project-ref>.supabase.co/auth/v1/callback`).
5. Supabase redirects back to `http://localhost:3020/auth/callback?code=...`.
6. `/auth/callback/route.ts` exchanges the `code` for session cookies on the server.
7. Database `profiles` table is queried:
   - If no profile: redirects to `/signup` (onboarding).
   - If profile with role `USER`: redirects to `/user`.
   - If profile with role `BUDDY`: redirects to `/buddy`.

## Phone OTP Flow (Step 18.6 & 18.6A THSMS Hook)
1. User enters 10-digit Thai phone number (Stage 1).
2. Number is normalized to E.164 (`+66...`) via `normalizeThaiPhoneNumber`.
3. `sendPhoneOtp(phone)` calls Supabase Auth `signInWithOtp({ phone })`.
4. Supabase Auth generates OTP and calls the Send SMS HTTP Auth Hook (`send-sms` Edge Function).
5. Edge Function verifies standard webhook signature, normalizes phone to Thai domestic format (`08...`), and calls THSMS API (`POST https://thsms.com/api/send-sms`) with sender `Target SMS`.
6. User receives SMS OTP from `Target SMS`.
7. Stage 2 opens with phone display, 6-digit numeric input, resend button with 60s cooldown, and back/edit button.
8. User enters OTP and clicks "ยืนยันรหัส OTP".
9. `verifyPhoneOtp(phone, otp)` calls Supabase Auth `verifyOtp({ phone, token, type: 'sms' })`.
10. Post-login destination is resolved from database profile:
    - No profile: redirects to `/signup` (onboarding).
    - Profile `USER`: redirects to `/user`.
    - Profile `BUDDY`: redirects to `/buddy`.

## Required External Configurations
- **Supabase Dashboard**:
  - `Authentication -> Providers -> Google` -> Enable Google provider, enter Client ID and Client Secret from Google Cloud Console.
  - `Authentication -> Providers -> Phone` -> Enable Phone provider.
  - `Authentication -> Hooks -> Send SMS` -> Configure HTTP Hook URL to `https://<PROJECT_REF>.supabase.co/functions/v1/send-sms` and set hook secret matching `SEND_SMS_HOOK_SECRET`.
  - `Authentication -> URL Configuration -> Redirect URLs` -> Add `http://localhost:3020/auth/callback`.
- **Supabase Edge Function Secrets**:
  - `THSMS_ACCESS_TOKEN`: THSMS API token.
  - `THSMS_SENDER`: "Target SMS".
  - `SEND_SMS_HOOK_SECRET`: Webhook secret from Supabase Auth Send SMS Hook.
- **Google Cloud Console**:
  - Authorized JavaScript Origins: `http://localhost:3020`
  - Authorized Redirect URI: The callback URL displayed in the Supabase Dashboard Google Provider configuration.

## Notes & Deferred Tasks
- **TODO**: Account linking between GOOGLE and PHONE is deferred.
- **Phone in Profiles**: Supabase Auth phone identity is separate from `profiles.phone`. Writing phone to profiles will be handled in the Onboarding Write Step.
