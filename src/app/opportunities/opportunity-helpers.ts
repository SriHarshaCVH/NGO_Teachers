import { TeachingMode } from "@prisma/client";

export function formatTeachingMode(mode: TeachingMode): string {
  switch (mode) {
    case TeachingMode.ONLINE:
      return "Online";
    case TeachingMode.OFFLINE:
      return "Offline";
    case TeachingMode.HYBRID:
      return "Hybrid";
    default:
      return String(mode);
  }
}

export function formatDeadlineShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
