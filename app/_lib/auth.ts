export type UserRole = "USER" | "BUDDY";

export type AuthProvider = "PHONE" | "GOOGLE";

export const ROLE_HOME_PATH: Record<UserRole, "/user" | "/buddy"> = {
  USER: "/user",
  BUDDY: "/buddy",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  USER: "ผู้รับบริการ",
  BUDDY: "Buddy / อสม.",
};

export const AUTH_PROVIDER_LABELS: Record<AuthProvider, string> = {
  PHONE: "เบอร์โทรศัพท์และ OTP",
  GOOGLE: "Google",
};
