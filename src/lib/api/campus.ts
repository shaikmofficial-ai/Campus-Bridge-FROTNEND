// Typed wrappers around every CampusBridge backend endpoint.
// Grouped by feature to keep call sites readable.

import { apiDownload, apiFetch } from "./client";
import type {
  AdminStats,
  AuthResponse,
  Conversation,
  DashboardResponse,
  ForumGroup,
  ForumPost,
  ForumPostPayload,
  Message,
  MentorConnection,
  MentorResponse,
  NotificationItem,
  PlacementDrive,
  PlacementStory,
  ProfileResponse,
  ProfileUpdatePayload,
  RegisterPayload,
  ReportItem,
  ReportPayload,
  ResourceItem,
} from "./types";

// ---------------- Auth ----------------
export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>("/api/auth/register", { method: "POST", body: payload }),
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/api/auth/login", { method: "POST", body: { email, password } }),
};

// ---------------- Dashboard ----------------
export const dashboardApi = {
  get: () => apiFetch<DashboardResponse>("/api/dashboard"),
};

// ---------------- Profile ----------------
export const profileApi = {
  me: () => apiFetch<ProfileResponse>("/api/profile"),
  byId: (id: number) => apiFetch<ProfileResponse>(`/api/profile/${id}`),
  update: (payload: ProfileUpdatePayload) =>
    apiFetch<ProfileResponse>("/api/profile", { method: "PUT", body: payload }),
};

// ---------------- Mentors ----------------
export const mentorApi = {
  list: (params?: { domain?: string; keyword?: string }) =>
    apiFetch<MentorResponse[]>("/api/mentors", { query: params }),
  connect: (mentorUserId: number) =>
    apiFetch<string>(`/api/mentors/${mentorUserId}/connect`, { method: "POST" }),
  acceptRequest: (requestId: number) =>
    apiFetch<MentorConnection>(`/api/mentors/requests/${requestId}/accept`, { method: "POST" }),
  rejectRequest: (requestId: number) =>
    apiFetch<MentorConnection>(`/api/mentors/requests/${requestId}/reject`, { method: "POST" }),
  connections: () => apiFetch<MentorConnection[]>("/api/mentors/connections"),
  pending: () => apiFetch<MentorConnection[]>("/api/mentors/pending"),
  sent: () => apiFetch<MentorConnection[]>("/api/mentors/sent"),
};

// ---------------- Forum ----------------
export const forumApi = {
  publicPosts: () => apiFetch<ForumPost[]>("/api/forum/public"),
  groups: () => apiFetch<ForumGroup[]>("/api/forum/groups"),
  createPost: (payload: ForumPostPayload) =>
    apiFetch<ForumPost>("/api/forum/posts", {
      method: "POST",
      // The backend's ForumPostRequest.isPublic is a Lombok boolean, which
      // Jackson binds from the JSON key "public" (not "isPublic"). Send both
      // so the post is correctly flagged public regardless.
      body: {
        title: payload.title,
        content: payload.content,
        category: payload.category,
        public: payload.isPublic,
        isPublic: payload.isPublic,
        groupId: payload.groupId ?? null,
      },
    }),
  addComment: (postId: number, content: string) =>
    apiFetch(`/api/forum/posts/${postId}/comments`, { method: "POST", body: { content } }),
  viewPost: (postId: number) => apiFetch<ForumPost>(`/api/forum/posts/${postId}`),
};

// ---------------- Resources ----------------
export const resourceApi = {
  list: (type?: string) => apiFetch<ResourceItem[]>("/api/resources", { query: { type } }),
  saved: () => apiFetch<ResourceItem[]>("/api/resources/saved"),
  upload: (data: { title: string; description?: string; department: string; type: string; file: File }) => {
    const form = new FormData();
    form.append("title", data.title);
    if (data.description) form.append("description", data.description);
    form.append("department", data.department);
    form.append("type", data.type);
    form.append("file", data.file);
    return apiFetch<ResourceItem>("/api/resources/upload", { method: "POST", formData: form });
  },
  save: (id: number) => apiFetch<string>(`/api/resources/${id}/save`, { method: "POST" }),
  unsave: (id: number) => apiFetch<string>(`/api/resources/${id}/save`, { method: "DELETE" }),
  download: (id: number) => apiDownload(`/api/resources/${id}/download`),
};

// ---------------- Placements ----------------
export const placementApi = {
  drives: () => apiFetch<PlacementDrive[]>("/api/placements/drives"),
  openDrives: () => apiFetch<PlacementDrive[]>("/api/placements/drives/open"),
  createDrive: (payload: Omit<PlacementDrive, "id" | "status" | "createdAt">) =>
    apiFetch<PlacementDrive>("/api/placements/drives", { method: "POST", body: payload }),
  stories: () => apiFetch<PlacementStory[]>("/api/placements/stories"),
  createStory: (payload: { companyName: string; role: string; packageAmount?: string; story: string }) =>
    apiFetch<PlacementStory>("/api/placements/stories", { method: "POST", body: payload }),
};

// ---------------- Messages ----------------
export const messageApi = {
  conversations: () => apiFetch<Conversation[]>("/api/messages/conversations"),
  messages: (conversationId: number) => apiFetch<Message[]>(`/api/messages/${conversationId}`),
  startConversation: (recipientId: number) =>
    apiFetch<Conversation>("/api/messages/conversations/start", {
      method: "POST",
      body: { recipientId },
    }),
  send: (conversationId: number, content: string) =>
    apiFetch<Message>("/api/messages/send", { method: "POST", body: { conversationId, content } }),
};

// ---------------- Notifications ----------------
export const notificationApi = {
  list: () => apiFetch<NotificationItem[]>("/api/notifications"),
  markRead: (id: number) => apiFetch(`/api/notifications/${id}/read`, { method: "POST" }),
  unreadCount: () => apiFetch<number>("/api/notifications/unread-count"),
};

// ---------------- Reports ----------------
export const reportApi = {
  create: (payload: ReportPayload) =>
    apiFetch<ReportItem>("/api/reports", { method: "POST", body: payload }),
};

// ---------------- Admin ----------------
export const adminApi = {
  stats: () => apiFetch<AdminStats>("/api/admin/stats"),
  pending: () => apiFetch<ProfileResponse[]>("/api/admin/pending"),
  approve: (id: number) => apiFetch<ProfileResponse>(`/api/admin/approve/${id}`, { method: "POST" }),
  reject: (id: number) => apiFetch<ProfileResponse>(`/api/admin/reject/${id}`, { method: "POST" }),
  reports: () => apiFetch<ReportItem[]>("/api/admin/reports"),
};
