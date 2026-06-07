import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Users, ShieldCheck, Flag, GraduationCap, CheckCircle2, XCircle, Loader2, AlertCircle,
  BookOpen, MessagesSquare, Briefcase, Trash2,
} from "lucide-react";
import { adminApi } from "@/lib/api/campus";
import { avatarUrl, timeAgo, titleCase } from "@/lib/ui";
import type { ProfileResponse, ReportItem } from "@/lib/api/types";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · CampusBridge" }] }),
  component: Admin,
});

function Admin() {
  const queryClient = useQueryClient();
  const statsQ = useQuery({ queryKey: ["admin", "stats"], queryFn: adminApi.stats });
  const pendingQ = useQuery({ queryKey: ["admin", "pending"], queryFn: adminApi.pending });
  const reportsQ = useQuery({ queryKey: ["admin", "reports"], queryFn: adminApi.reports });

  const decide = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "approve" | "reject" }) =>
      action === "approve" ? adminApi.approve(id) : adminApi.reject(id),
    onSuccess: (_d, v) => {
      toast.success(v.action === "approve" ? "User approved" : "User rejected");
      queryClient.invalidateQueries({ queryKey: ["admin", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Action failed"),
  });

  const resolveReport = useMutation({
    mutationFn: (id: number) => adminApi.resolveReport(id),
    onSuccess: () => {
      toast.success("Report dismissed");
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Action failed"),
  });

  const deleteContent = useMutation({
    mutationFn: (r: ReportItem) =>
      r.targetType === "RESOURCE"
        ? adminApi.deleteResource(r.targetId!)
        : adminApi.deleteForumPost(r.targetId!),
    onSuccess: () => {
      toast.success("Content deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const stats = statsQ.data;
  const pending = pendingQ.data ?? [];
  const reports = reportsQ.data ?? [];

  const cards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers, tone: "bg-info/15 text-info" },
    { icon: GraduationCap, label: "Students", value: stats?.totalStudents, tone: "bg-primary/15 text-primary" },
    { icon: ShieldCheck, label: "Mentors", value: stats?.totalMentors, tone: "bg-success/15 text-success" },
    { icon: ShieldCheck, label: "Pending Verifications", value: stats?.pendingVerifications, tone: "bg-warning/15 text-warning" },
    { icon: Flag, label: "Open Reports", value: stats?.openReports, tone: "bg-destructive/15 text-destructive" },
    { icon: MessagesSquare, label: "Forum Posts", value: stats?.totalForumPosts, tone: "bg-info/15 text-info" },
    { icon: BookOpen, label: "Resources", value: stats?.totalResources, tone: "bg-warning/15 text-warning" },
    { icon: Briefcase, label: "Placement Drives", value: stats?.totalPlacementDrives, tone: "bg-accent text-primary" },
  ];

  return (
    <AppShell title="Admin Dashboard" subtitle="Verification, moderation and platform analytics." requireRole="admin">
      {statsQ.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive flex items-center gap-2 mb-6">
          <AlertCircle className="size-4" /> {statsQ.error instanceof Error ? statsQ.error.message : "Failed to load stats."}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-3xl font-bold mt-1 tabular-nums">
                  {statsQ.isLoading ? "—" : (s.value ?? 0)}
                </div>
              </div>
              <div className={`size-9 grid place-items-center rounded-xl ${s.tone}`}><s.icon className="size-4" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold mb-4">Pending Verifications</h2>
          {pendingQ.isLoading ? (
            <Loading />
          ) : pending.length === 0 ? (
            <Empty text="No pending verifications." />
          ) : (
            <ul className="space-y-3">
              {pending.map((u: ProfileResponse) => (
                <li key={u.id} className="flex items-center gap-3 rounded-xl bg-surface p-3">
                  <img src={avatarUrl(u.profilePictureUrl, u.id)} alt="" className="size-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {titleCase(u.role)}{u.registerNumber ? ` · ${u.registerNumber}` : ""}{u.department ? ` · ${u.department}` : ""}{u.batch ? ` · ${u.batch}` : ""}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full" disabled={decide.isPending}
                    onClick={() => decide.mutate({ id: u.id, action: "reject" })}>
                    <XCircle className="size-3.5" /> Reject
                  </Button>
                  <Button size="sm" className="rounded-full bg-success text-white hover:opacity-95" disabled={decide.isPending}
                    onClick={() => decide.mutate({ id: u.id, action: "approve" })}>
                    <CheckCircle2 className="size-3.5" /> Approve
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold mb-4">Moderation Queue</h2>
          {reportsQ.isLoading ? (
            <Loading />
          ) : reports.length === 0 ? (
            <Empty text="No open reports." />
          ) : (
            <ul className="space-y-3">
              {reports.map((r: ReportItem) => {
                const isContent = r.targetType === "FORUM_POST" || r.targetType === "RESOURCE";
                const typeLabel = r.targetType === "FORUM_POST" ? "Forum Post"
                  : r.targetType === "RESOURCE" ? "Resource" : "User";
                return (
                  <li key={r.id} className="rounded-xl bg-surface p-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 grid place-items-center rounded-lg bg-destructive/15 text-destructive shrink-0"><Flag className="size-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{r.reason}</span>
                          <span className="text-[10px] uppercase rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{typeLabel}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {isContent
                            ? `"${r.targetTitle ?? "Untitled"}"`
                            : r.reportedUserName ? `Against ${r.reportedUserName}` : "—"}
                          {r.createdAt ? ` · ${timeAgo(r.createdAt)}` : ""}
                        </div>
                        {r.description && <div className="text-xs text-muted-foreground/80 mt-0.5 truncate">{r.description}</div>}
                      </div>
                      <span className={`text-[10px] uppercase rounded-full px-2 py-0.5 shrink-0 ${r.status === "OPEN" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{r.status}</span>
                    </div>
                    {r.status === "OPEN" && (
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" className="rounded-full" disabled={resolveReport.isPending}
                          onClick={() => resolveReport.mutate(r.id)}>
                          Dismiss
                        </Button>
                        {isContent && r.targetId != null && (
                          <Button size="sm" className="rounded-full bg-destructive text-white hover:opacity-95"
                            disabled={deleteContent.isPending}
                            onClick={() => {
                              if (confirm(`Permanently delete this ${typeLabel.toLowerCase()}? This cannot be undone.`)) {
                                deleteContent.mutate(r);
                              }
                            }}>
                            <Trash2 className="size-3.5" /> Delete {typeLabel}
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Loading() {
  return <div className="grid place-items-center py-8 text-muted-foreground"><div className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> Loading…</div></div>;
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{text}</div>;
}
