// TypeScript shapes mirroring the CampusBridge Spring Boot DTOs.
//
// NOTE: Lombok serializes boolean fields named `isX` without the `is` prefix
// (isRead -> "read", isGroup -> "group", isPublic -> "public",
// isPrivate -> "private"). We declare both keys optional and read defensively
// via the helpers in `./normalize`.

export type BackendRole = "STUDENT" | "ALUMNI" | "MENTOR" | "ADMIN";
export type Role = "student" | "alumni" | "mentor" | "admin";

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: BackendRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: BackendRole;
  department?: string;
  batch?: string;
}

export interface ProfileResponse {
  id: number;
  name: string;
  email: string;
  role: BackendRole;
  department?: string;
  batch?: string;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  profilePictureUrl?: string;
  skills?: string[];
  achievements?: string[];
  communityPoints: number;
  accountStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export interface ProfileUpdatePayload {
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  achievements?: string[];
}

export interface PlacementDrive {
  id: number;
  companyName: string;
  role: string;
  packageAmount?: string;
  location?: string;
  eligibilityCriteria?: string;
  applicationDeadline?: string; // ISO date
  applicationLink?: string;
  description?: string;
  status: "OPEN" | "CLOSED" | string;
  createdAt?: string;
}

export interface PlacementStory {
  id: number;
  companyName: string;
  studentName?: string;
  role: string;
  packageAmount?: string;
  story: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface DashboardResponse {
  userId: number;
  userName: string;
  role: BackendRole;
  mentorsConnected: number;
  resourcesSaved: number;
  forumInteractions: number;
  communityPoints: number;
  upcomingPlacementDrives: PlacementDrive[];
  recommendedMentors: ProfileResponse[];
}

export interface MentorResponse {
  id: number; // this is the mentor's USER id (used for /connect)
  name: string;
  designation?: string;
  company?: string;
  rating: number;
  reviewCount: number;
  skills?: string[];
  domains?: string[];
  profilePicture?: string;
}

export interface MentorConnection {
  id: number;
  mentorId: number;
  mentorName: string;
  mentorEmail: string;
  mentorProfilePicture?: string;
  mentorDepartment?: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | string;
  requestedAt?: string;
  respondedAt?: string;
}

export interface ForumAuthor {
  id: number;
  name: string;
  role?: BackendRole;
  profilePictureUrl?: string;
}

export interface ForumPost {
  id: number;
  author?: ForumAuthor;
  title: string;
  content?: string;
  category?: string;
  views: number;
  commentCount: number;
  public?: boolean;
  isPublic?: boolean;
  group?: ForumGroup | null;
  createdAt?: string;
}

export interface ForumGroup {
  id: number;
  name: string;
  description?: string;
  private?: boolean;
  isPrivate?: boolean;
  memberCount: number;
}

export interface ForumPostPayload {
  title: string;
  content: string;
  category: string;
  isPublic: boolean;
  groupId?: number | null;
}

export interface ResourceItem {
  id: number;
  title: string;
  description?: string;
  type: string;
  department?: string;
  fileSize?: string;
  downloadCount: number;
  uploaderName?: string;
  saved: boolean;
  uploadedAt?: string;
}

export interface ConversationParticipant {
  id: number;
  name: string;
  profilePicture?: string;
}

export interface Conversation {
  id: number;
  group?: boolean;
  isGroup?: boolean;
  groupName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  participants: ConversationParticipant[];
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderPicture?: string;
  content: string;
  read?: boolean;
  isRead?: boolean;
  sentAt?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type?: string;
  read?: boolean;
  isRead?: boolean;
  createdAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalMentors: number;
  totalForumPosts: number;
  totalResources: number;
  totalPlacementDrives: number;
  pendingVerifications: number;
  openReports: number;
}

export interface ReportItem {
  id: number;
  reporterId: number;
  reporterName: string;
  reportedUserId?: number;
  reportedUserName?: string;
  reason: string;
  description?: string;
  status: "OPEN" | "RESOLVED" | string;
  createdAt?: string;
}

export interface ReportPayload {
  reportedUserId: number;
  reason: string;
  description?: string;
}
