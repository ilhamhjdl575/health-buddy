# Supabase Database Schema

## Overview
This directory contains the database migration scripts and schema documentation for Health Buddy.

- **Migrations**:
  - `migrations/001_initial_health_buddy_schema.sql` (Step 16: Core Database Schema)
  - `migrations/002_basic_rls_policies.sql` (Step 18.3: Basic Row Level Security Policies)
  - `migrations/003_protect_profile_identity_fields.sql` (Step 18.4: Role Escalation Protection & Least Privilege Hardening)
  - `migrations/004_complete_profile_onboarding.sql` (Transactional authenticated USER/BUDDY onboarding RPC)
  - `migrations/005_buddy_signup_details.sql` (Step 18.6: Buddy types, work modes, and certificate bucket)
  - `migrations/006_complete_onboarding_persistence.sql` (Step 18.7: End-to-end onboarding persistence with emergency contacts, mutual exclusion mobility, work mode validation, and certificate storage policies)
  - `migrations/017_local_coordinator.sql` (Local health center coordinator contact, readable by authenticated users and managed server-side)
  - `migrations/018_unlisted_coordinator_management.sql` (Narrow read/write RPCs for the unlisted coordinator management page)

## System Constraints & Enums
- **User Roles**: Strictly `USER` and `BUDDY` (No ADMIN, no PROFESSIONAL).
- **Service Types**: Strictly `DOCTOR_VISIT` and `BEDRIDDEN_CARE`.
- **Qualification Types**: Strictly `BEDRIDDEN_CARE_TRAINING`.
- **Qualification Status**: `PENDING`, `VERIFIED`, `REJECTED`, `EXPIRED`.
- **Service Request Status**:
  - `REQUESTED` -> `MATCHING` -> `OPEN` -> `ACCEPTED` -> `ON_THE_WAY` -> `ARRIVED` -> `IN_SERVICE` -> `COMPLETED` -> `FOLLOW_UP` -> `CLOSED`
  - Cancellation/Failure: `CANCELLED`, `NO_BUDDY_FOUND`
- **Job Assignment Status**: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `COMPLETED`.
- **Follow-up Status**: `PENDING`, `CONTACTED`, `NEEDS_HELP`, `CLOSED`.
- **Follow-up Action Types**: `CALL_USER`, `CALL_FAMILY`, `CALL_HEALTH_CENTER`, `CLOSE_CASE`.

## Core Tables (11 Tables)
1. `profiles`: Base user record (USER or BUDDY) linked to `auth_user_id`.
2. `mobility_profiles`: Physical mobility and assistance flags for USER (1:1 with `profiles`).
3. `emergency_contacts`: Emergency contact persons for USER (1:N with `profiles`).
4. `buddy_profiles`: Buddy service area and active status (1:1 with `profiles`).
5. `buddy_qualifications`: Special certifications (e.g., `BEDRIDDEN_CARE_TRAINING`).
6. `availability_slots`: Buddy available dates and time shifts.
7. `service_requests`: Main client booking requests.
8. `job_assignments`: Job assignment and acceptance with single-active partial index.
9. `job_status_history`: Audit trail for timeline tracking.
10. `follow_up_cases`: Follow-up cases after service completion.
11. `follow_up_actions`: Action logs for follow-up cases.

## Edge Functions
- `functions/send-sms/index.ts`: Supabase Send SMS Auth Hook integration with THSMS (Step 18.6A).
  - Handles HTTP POST from Supabase Auth Hook with Standard Webhooks signature verification.
  - Normalizes phone numbers from E.164 (`+66...`) to Thai local format (`08...`).
  - Calls THSMS API (`POST https://thsms.com/api/send-sms`) with sender `Target SMS`.
  - Configured with `verify_jwt = false` in `supabase/config.toml` (secured via webhook secret verification).

## Key Architecture & Privacy Rules
1. **Emergency Flow**: Emergency is separate from the booking flow. Emergency events do not enter `service_requests` and are never put in `MATCHING`.
2. **Privacy Before Acceptance**: Before a Buddy accepts an open job, personal client information is withheld. After acceptance, necessary details are accessible.
3. **Bedridden Care Qualification**: When `service_type = 'BEDRIDDEN_CARE'`, the backend/RPC accept job verification must ensure the buddy has `BEDRIDDEN_CARE_TRAINING` with status `VERIFIED`.
4. **Row Level Security**:
   - RLS is enabled on all 11 tables.
   - Basic policies are established in `002_basic_rls_policies.sql`:
     - `profiles`: Select own, Update own (`auth_user_id = auth.uid()`).
     - `mobility_profiles`: Select own, Update own (`user_id = auth_profile_id()`).
     - `emergency_contacts`: Manage own (SELECT, INSERT, UPDATE, DELETE).
     - `buddy_profiles`: Select own, Update own (`buddy_id = auth_profile_id()`).
     - `buddy_qualifications`: Select own. (No client insert/update to protect verification status).
     - `availability_slots`: Manage own (SELECT, INSERT, UPDATE, DELETE).
     - `service_requests`: Select own requests.
     - `job_assignments`, `job_status_history`, `follow_up_cases`, `follow_up_actions`: Deny-by-default.
