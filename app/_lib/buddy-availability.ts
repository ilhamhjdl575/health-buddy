export type BuddyAvailabilityStatus = "AVAILABLE" | "OFFLINE";

export type AvailabilitySlot = {
  id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
};

export const initialAvailabilitySlots: AvailabilitySlot[] = [
  {
    id: "slot-1",
    date: "2026-11-10",
    startTime: "08:00",
    endTime: "12:00",
  },
  {
    id: "slot-2",
    date: "2026-11-11",
    startTime: "13:00",
    endTime: "17:00",
  },
];

export function formatDateThai(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function isOverlapping(
  slotA: { startTime: string; endTime: string },
  slotB: { startTime: string; endTime: string },
): boolean {
  return slotA.startTime < slotB.endTime && slotB.startTime < slotA.endTime;
}

export function findOverlappingSlot(
  slots: AvailabilitySlot[],
  candidate: { date: string; startTime: string; endTime: string },
  excludeId?: string,
): AvailabilitySlot | undefined {
  return slots.find(
    (slot) =>
      slot.id !== excludeId &&
      slot.date === candidate.date &&
      isOverlapping(slot, candidate),
  );
}

