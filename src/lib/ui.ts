// Small presentation helpers shared across pages.

/** Stable avatar: use the backend picture if present, else a seeded fallback. */
export function avatarUrl(picture: string | undefined | null, seed: string | number, size = 120): string {
  if (picture && picture.trim()) return picture;
  return `https://i.pravatar.cc/${size}?u=${encodeURIComponent(String(seed))}`;
}

/** "2h ago" / "3d ago" style relative time from an ISO string. */
export function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Short date like "15 May 2025". */
export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

/** Time like "10:30 AM". */
export function formatTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** Title-case a single word/label, e.g. "MENTOR" -> "Mentor". */
export function titleCase(value?: string | null): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
