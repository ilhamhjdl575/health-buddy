import type { MobilityProfileRecord, BuddyProfileRecord } from "./types";

/**
 * Default mobility settings for USER.
 * All mobility assistance flags default to false.
 */
export const DEFAULT_MOBILITY_PROFILE: Omit<
  MobilityProfileRecord,
  "id" | "user_id" | "created_at" | "updated_at"
> = {
  uses_wheelchair: false,
  uses_cane: false,
  uses_walker: false,
  needs_walking_assistance: false,
  difficulty_using_stairs: false,
  is_bedridden: false,
  note: null,
};

/**
 * Default buddy profile values for BUDDY.
 * service_area defaults to null and is_active defaults to true.
 */
export const DEFAULT_BUDDY_PROFILE: Omit<
  BuddyProfileRecord,
  "id" | "buddy_id" | "created_at" | "updated_at"
> = {
  service_area: null,
  is_active: true,
};

/**
 * Strict rule: All newly submitted qualifications default to PENDING.
 * They are NEVER automatically verified on onboarding.
 */
export const INITIAL_QUALIFICATION_STATUS = "PENDING" as const;
