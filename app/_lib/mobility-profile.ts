const BEDRIDDEN_STORAGE_KEY = "healthbuddy_user_is_bedridden";
const MOBILITY_PROFILE_EVENT = "healthbuddy_mobility_profile_changed";

export function getBedriddenSnapshot() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(BEDRIDDEN_STORAGE_KEY) === "true";
}

export function subscribeToMobilityProfile(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === BEDRIDDEN_STORAGE_KEY) callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(MOBILITY_PROFILE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(MOBILITY_PROFILE_EVENT, callback);
  };
}

export function saveBedriddenStatus(isBedridden: boolean) {
  window.localStorage.setItem(BEDRIDDEN_STORAGE_KEY, String(isBedridden));
  window.dispatchEvent(new Event(MOBILITY_PROFILE_EVENT));
}
