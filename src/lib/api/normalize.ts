// Helpers to read fields that Spring/Lombok may serialize under either the
// `isX` name or the de-prefixed `x` name, plus role normalization.

import type {
  BackendRole,
  Conversation,
  ForumPost,
  Message,
  NotificationItem,
  Role,
} from "./types";

export function toRole(role: BackendRole | string | undefined | null): Role {
  return (role ?? "student").toString().toLowerCase() as Role;
}

export function isMessageRead(m: Message): boolean {
  return Boolean(m.read ?? m.isRead);
}

export function isNotificationRead(n: NotificationItem): boolean {
  return Boolean(n.read ?? n.isRead);
}

export function isConversationGroup(c: Conversation): boolean {
  return Boolean(c.group ?? c.isGroup);
}

export function isPostPublic(p: ForumPost): boolean {
  return Boolean(p.public ?? p.isPublic);
}
