// Typed wrappers around every CampusBridge backend endpoint.
// Grouped by feature to keep call sites readable.

import { apiDownload, apiFetch } from "./client";
import type {
  AdminStats,
  AuthResponse,
  Conversation,
  DashboardResponse,
  ExternalJob,
  ForumGroup,
  ForumComment,
  ForumGroupPayload,
  ForumPost,
  ForumPostPayload,
  Message,
  MentorConnection,
  MentorJob,
  MentorJobPayload,
  MentorPlacement,
  MentorPlacementPayload,
  MentorProfilePayload,
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
  StudentResponse,
  TrendingArticle,
  Snapshot,
  PublicProfile,
  LearningNode,
  CodeRunResult,
  LeaderboardEntry,
} from "./types";

// ---------------- Auth ----------------
export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>("/api/auth/register", { method: "POST", body: payload }),
  // identifier = email OR register number. Send both keys for backend compatibility.
  login: (identifier: string, password: string) =>
    apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { email: identifier, identifier, password },
    }),
};

// ---------------- Dashboard ----------------
export const dashboardApi = {
  get: () => apiFetch<DashboardResponse>("/api/dashboard"),
};

// ---------------- Profile ----------------
export const profileApi = {
  me: () => apiFetch<ProfileResponse>("/api/profile"),
  byId: (id: number) => apiFetch<ProfileResponse>(`/api/profile/${id}`),
  publicById: (id: number) => apiFetch<PublicProfile>(`/api/profile/${id}/public`),
  update: (payload: ProfileUpdatePayload) =>
    apiFetch<ProfileResponse>("/api/profile", { method: "PUT", body: payload }),
  uploadPicture: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<ProfileResponse>("/api/profile/picture", { method: "POST", formData: form });
  },
};

// ---------------- Mentors ----------------
export const mentorApi = {
  list: (params?: { domain?: string; keyword?: string }) =>
    apiFetch<MentorResponse[]>("/api/mentors", { query: params }),
  profile: (mentorUserId: number) =>
    apiFetch<MentorResponse>(`/api/mentors/${mentorUserId}/profile`),
  updateMyProfile: (payload: MentorProfilePayload) =>
    apiFetch<MentorResponse>("/api/mentors/profile", { method: "PUT", body: payload }),
  connect: (mentorUserId: number) =>
    apiFetch<string>(`/api/mentors/${mentorUserId}/connect`, { method: "POST" }),
  acceptRequest: (requestId: number) =>
    apiFetch<MentorConnection>(`/api/mentors/requests/${requestId}/accept`, { method: "POST" }),
  rejectRequest: (requestId: number) =>
    apiFetch<MentorConnection>(`/api/mentors/requests/${requestId}/reject`, { method: "POST" }),
  connections: () => apiFetch<MentorConnection[]>("/api/mentors/connections"),
  pending: () => apiFetch<MentorConnection[]>("/api/mentors/pending"),
  sent: () => apiFetch<MentorConnection[]>("/api/mentors/sent"),
  // Placement tracker ("Students Placed Under Guidance")
  placements: (mentorUserId: number) =>
    apiFetch<MentorPlacement[]>(`/api/mentors/${mentorUserId}/placements`),
  addPlacement: (payload: MentorPlacementPayload) =>
    apiFetch<MentorPlacement>("/api/mentors/placements", { method: "POST", body: payload }),
  removePlacement: (id: number) =>
    apiFetch(`/api/mentors/placements/${id}`, { method: "DELETE" }),
  // Students with an ACCEPTED connection to the calling mentor (placement selector).
  connectedStudents: () => apiFetch<StudentResponse[]>("/api/mentors/connected-students"),
};

// ---------------- Students (mentor/alumni discovery) ----------------
export const studentApi = {
  // Skill-based student discovery for mentors/alumni. Never returns mentors.
  discover: (params?: { skill?: string; keyword?: string }) =>
    apiFetch<StudentResponse[]>("/api/students", { query: params }),
};

// ---------------- Forum ----------------
export const forumApi = {
  publicPosts: () => apiFetch<ForumPost[]>("/api/forum/public"),
  groups: () => apiFetch<ForumGroup[]>("/api/forum/groups"),
  createGroup: (payload: ForumGroupPayload) =>
    apiFetch<ForumGroup>("/api/forum/groups", {
      method: "POST",
      // Backend's isPrivate is a Lombok boolean -> Jackson key "private". Send both.
      body: { name: payload.name, description: payload.description, private: payload.isPrivate, isPrivate: payload.isPrivate },
    }),
  groupPosts: (groupId: number) => apiFetch<ForumPost[]>(`/api/forum/groups/${groupId}/posts`),
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
  comments: (postId: number) => apiFetch<ForumComment[]>(`/api/forum/posts/${postId}/comments`),
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
  jobs: (params?: { query?: string; location?: string }) =>
    apiFetch<ExternalJob[]>("/api/jobs", { query: params }),
  refreshJobs: () => apiFetch<{ refreshed: number }>("/api/jobs/refresh", { method: "POST" }),
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

// ---------------- Jobs (cached internal board) ----------------
export const jobApi = {
  // Serves instantly from the locally cached records (refreshed by the
  // background JobAutomationService every 6 hours).
  list: (params?: { query?: string; location?: string }) =>
    apiFetch<ExternalJob[]>("/api/jobs", { query: params }),
  refresh: () => apiFetch<{ refreshed: number }>("/api/jobs/refresh", { method: "POST" }),
};

// ---------------- Trending tutorials (Dev.to) ----------------
export const educationApi = {
  trending: (tag?: string, perPage = 10) =>
    apiFetch<TrendingArticle[]>("/api/resources/trending", { query: { tag, perPage } }),
};

// ---------------- Mentor Job Board ----------------
export const mentorJobApi = {
  list: () => apiFetch<MentorJob[]>("/api/mentor-jobs"),
  create: (payload: MentorJobPayload) =>
    apiFetch<MentorJob>("/api/mentor-jobs", { method: "POST", body: payload }),
  remove: (id: number) => apiFetch(`/api/mentor-jobs/${id}`, { method: "DELETE" }),
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
  resolveReport: (id: number) => apiFetch<ReportItem>(`/api/admin/reports/${id}/resolve`, { method: "POST" }),
  deleteForumPost: (id: number) => apiFetch(`/api/admin/forum/posts/${id}`, { method: "DELETE" }),
  deleteResource: (id: number) => apiFetch(`/api/admin/resources/${id}`, { method: "DELETE" }),
  // Student directory + ban system
  users: () => apiFetch<ProfileResponse[]>("/api/admin/users"),
  searchUsers: (query: string) =>
    apiFetch<ProfileResponse[]>("/api/admin/users/search", { query: { query } }),
  banUser: (id: number) => apiFetch<ProfileResponse>(`/api/admin/users/${id}/ban`, { method: "POST" }),
  unbanUser: (id: number) => apiFetch<ProfileResponse>(`/api/admin/users/${id}/unban`, { method: "POST" }),
};

// ---------------- Analytics (PRI growth) ----------------
export const analyticsApi = {
  snapshots: (userId: number) => apiFetch<Snapshot[]>(`/api/analytics/snapshots/${userId}`),
};

// ---------------- Learn Coding ----------------
export const learningApi = {
  roadmap: () => apiFetch<LearningNode[]>("/api/learning/roadmap"),
  submit: (payload: { moduleOrderId: number; code: string; languageId?: number }) =>
    apiFetch<CodeRunResult>("/api/learning/submit", { method: "POST", body: payload }),
};

// ---------------- Leaderboard ----------------
export const leaderboardApi = {
  global: () => apiFetch<LeaderboardEntry[]>("/api/leaderboard/global"),
};
