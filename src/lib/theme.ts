export const THEMES = [
  { id: "ocean", label: "Ocean Blue", description: "Light blue & white. Apple + Notion.", swatch: ["#e0f2fe", "#3b82f6", "#1d4ed8"] },
  { id: "dark", label: "Dark Mode", description: "Black + purple neon. Linear + Discord.", swatch: ["#0b0b14", "#a855f7", "#6366f1"] },
  { id: "purple", label: "Purple Gradient", description: "Lavender, pink & purple gradients.", swatch: ["#f5f3ff", "#a855f7", "#ec4899"] },
  { id: "nature", label: "Nature Green", description: "Mint white with emerald accents.", swatch: ["#ecfdf5", "#10b981", "#047857"] },
  { id: "minimal", label: "Minimal Black", description: "Matte black, white outlines.", swatch: ["#0a0a0a", "#ffffff", "#525252"] },
  { id: "college", label: "College Classic", description: "Cream + maroon. Academic feel.", swatch: ["#fdf6e3", "#9b1c2c", "#7c1d1d"] },
  { id: "cyber", label: "Cyber Neon", description: "Navy + neon glow. Tron / gaming.", swatch: ["#05070f", "#22d3ee", "#ec4899"] },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const KEY = "cb-theme";
export const DEFAULT_THEME: ThemeId = "ocean";

export function getTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const v = window.localStorage.getItem(KEY) as ThemeId | null;
  return v && THEMES.some((t) => t.id === v) ? v : DEFAULT_THEME;
}

export function applyTheme(theme: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  // Toggle Tailwind .dark variant for themes with dark surfaces
  const isDark = theme === "dark" || theme === "minimal" || theme === "cyber";
  document.documentElement.classList.toggle("dark", isDark);
  try { window.localStorage.setItem(KEY, theme); } catch {}
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
}
