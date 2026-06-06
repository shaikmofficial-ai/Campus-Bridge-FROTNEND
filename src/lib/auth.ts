// Client-side auth backed by the CampusBridge Spring Boot JWT API.
//
// The JWT lives in localStorage (managed by ./api/client). A lightweight copy
// of the authenticated user (id, name, email, role) is cached here so the UI
// can render instantly without an extra round-trip.

import { authApi, profileApi } from "./api/campus";
import { clearToken, setToken } from "./api/client";
import { toRole } from "./api/normalize";
import type { RegisterPayload } from "./api/types";

export type Role = "student" | "alumni" | "mentor" | "admin";

export type AuthUser = {
  id?: number;
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

function storeUser(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("campusbridge:auth"));
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

/** Sign in against the backend, persist token + user, return the user. */
export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const res = await authApi.login(email.trim(), password);
  setToken(res.token);
  const user: AuthUser = { name: res.name, email: res.email, role: toRole(res.role) };
  storeUser(user);
  await hydrateUserId(user);
  return getUser() ?? user;
}

/** Register a new account; the backend returns a token so we auto-sign-in. */
export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const res = await authApi.register(payload);
  setToken(res.token);
  const user: AuthUser = { name: res.name, email: res.email, role: toRole(res.role) };
  storeUser(user);
  await hydrateUserId(user);
  return getUser() ?? user;
}

/** Best-effort fetch of the numeric user id (needed for chat ownership checks). */
async function hydrateUserId(user: AuthUser) {
  try {
    const profile = await profileApi.me();
    storeUser({ ...user, id: profile.id });
  } catch {
    // Non-fatal: keep the user signed in even if the profile call fails.
  }
}

export function signOut() {
  clearToken();
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("campusbridge:auth"));
  }
}
