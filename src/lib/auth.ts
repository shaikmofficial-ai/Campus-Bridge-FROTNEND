// Lightweight client-side auth shim for the demo CampusBridge UI.
// Replace with real Lovable Cloud auth when wiring backend.

export type Role = "student" | "alumni" | "mentor" | "admin";

export type AuthUser = {
  email: string;
  name: string;
  role: Role;
};

const KEY = "campusbridge.auth";

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

export function signIn(email: string, _password: string): AuthUser {
  const role: Role = email.toLowerCase().includes("admin") ? "admin" : "student";
  const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const user: AuthUser = { email, name: name || "Member", role };
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("campusbridge:auth"));
  return user;
}

export function signOut() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("campusbridge:auth"));
}
