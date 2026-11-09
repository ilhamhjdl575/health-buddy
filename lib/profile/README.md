# Health Buddy Profile Creation & Onboarding Persistence

## System of Record Policy
> **Supabase PostgreSQL is the current system of record.**
> **Local PostgreSQL is not used unless a future requirement explicitly requires a separate database.**
>
> In Step 18.7:
> - No `DATABASE_URL` is configured for local PostgreSQL.
> - No separate PostgreSQL connection pool or client is instantiated.
> - No dual-write or database synchronization is performed.
> - All identity, profile, mobility, emergency contacts, buddy details, and qualifications reside solely in Supabase PostgreSQL.

---

## Overview
Step 18.7 achieves full end-to-end persistence for Health Buddy onboarding on Supabase:
- **Roles**: Strictly `USER` | `BUDDY` (No ADMIN, no PROFESSIONAL).
- **First-login Flow**:
  1. Authenticated user (e.g. Google OAuth) navigates to `/signup`.
  2. If user already has a complete profile in database: automatically redirected to `/user` or `/buddy` (prevents duplicate onboarding).
  3. Selects role (`USER` or `BUDDY`).
  4. Fills in onboarding details.
  5. Validated via Zod schemas and server contracts.
  6. Atomic execution via trusted PostgreSQL RPC `complete_profile_onboarding`.
  7. Successful completion verifies database profile resolution and redirects to `/user` or `/buddy`.

---

## Data Models & Persistence Mappings

### 1. USER Signup — Patient Self (`PATIENT`)
Persisted atomically in a single transaction:
- **`profiles`**:
  - `auth_user_id`: From `auth.uid()` (never trusted from client)
  - `role`: `'USER'`
  - `first_name`, `last_name`
  - `phone`, `email`
  - `birth_date`
  - `gender` (inclusive gender enum)
- **`mobility_profiles`**:
  - `uses_wheelchair`, `uses_cane`, `uses_walker`, `needs_walking_assistance`, `difficulty_using_stairs`, `is_bedridden`
  - **Mutual Exclusion Business Rule**: If `walks_normally` ("เดินได้คล่อง") is selected, all mobility limitations are set to `false`.
  - `is_bedridden` is persisted to DB and local storage to gate `BEDRIDDEN_CARE` service requests.
- **`emergency_contacts`**:
  - Automatically created with `name`, `relationship`, `phone`, and `is_primary = true`.

### 2. USER Signup — Caregiver Schema Gap Analysis
- **Current State**:
  The current schema (migrations 001–006) manages a 1:1 relation between an authenticated user (`auth.users`) and their personal `profiles` row.
  There is currently **no relation table** (such as `patients` or `caregiver_patient_links`) to separate caregiver user credentials from patient clinical/demographic profiles without mixing them ambiguously in the same row.
- **Contract Decision (Step 18.7)**:
  - In accordance with prompt rules ("ห้าม invent relation แบบสุ่ม" and "อย่าเอาข้อมูลผู้ดูแลกับผู้ป่วยไปใส่ row เดียวกันแบบกำกวม"), the caregiver flow is explicitly blocked with `isSchemaGap: true` and documented.
  - An informational notification is displayed in the signup UI for users choosing "ผู้ดูแลผู้ป่วย".
  - **TODO**: In a future step dedicated to Caregiver-Patient Relations, introduce a dedicated `patients` table and `caregiver_patient_links` junction table.

### 3. BUDDY Signup
Persisted atomically in a single transaction:
- **`profiles`**: `auth_user_id`, `role = BUDDY`, `first_name`, `last_name`, `phone`, `gender`.
- **`buddy_profiles`**:
  - `religion`: Required
  - `gender`: Required
  - `work_modes`: `TEXT[]` (`DAILY`, `MONTHLY`)
  - `is_active`: `true`
  - **Caregiver Work Model Validation**: If `CAREGIVER_420_HOURS` is chosen, at least one work mode (`DAILY` or `MONTHLY`) is strictly validated both on client/Zod schema and inside the database RPC.
- **`buddy_qualifications`**:
  - Types: `BEDRIDDEN_CARE_TRAINING`, `VILLAGE_HEALTH_VOLUNTEER`, `CAREGIVER_420_HOURS`
  - Status: Strictly `'PENDING'` (never automatically `VERIFIED`)
  - `certificate_path`: Verified storage path in private bucket `buddy-certificates`.

---

## Storage & Security Hardening
1. **Private Bucket**: `buddy-certificates` is private (`public = false`).
2. **Ownership Enforcement**: Storage path is generated as `${user.id}/${qualification_type}-${uuid}.${ext}`.
3. **Storage RLS Policies**:
   - `INSERT`: Allowed only when `(storage.foldername(name))[1] = auth.uid()::TEXT`.
   - `SELECT`: Allowed only when `(storage.foldername(name))[1] = auth.uid()::TEXT`.
   - `DELETE`: Allowed only when `(storage.foldername(name))[1] = auth.uid()::TEXT`.
4. **RPC Security**:
   - `complete_profile_onboarding` runs as `SECURITY DEFINER` with fixed `search_path = public`.
   - Uses `auth.uid()` from the active session.
   - Idempotency guard: raises exception if profile already exists for `auth_user_id`.
