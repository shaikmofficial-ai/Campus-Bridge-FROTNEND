import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, MessagesSquare, Trophy, Calendar, ArrowUpRight, Rocket, Loader2, AlertCircle } from "lucide-react";
import { dashboardApi, mentorApi, profileApi } from "@/lib/api/campus";
import { TrendingTutorials } from "@/components/trending-tutorials";
import { avatarUrl, formatDate, titleCase } from "@/lib/ui";
import type { ProfileResponse } from "@/lib/api/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · CampusBridge" }] }),
  component: Dashboard,
});

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number | string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold mt-1 tabular-nums">{value}</div>
        </div>
        <div className={`size-9 grid place-items-center rounded-xl ${tone}`}><Icon className="size-4" /></div>
      </div>
      <div className="mt-3 text-xs text-success flex items-center gap-1"><ArrowUpRight className="size-3" /> updated live</div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  });

  const profileQ = useQuery({ queryKey: ["profile", "me"], queryFn: profileApi.me });
  const mySkills = profileQ.data?.skills;

  const connect = useMutation({
    mutationFn: (mentorId: number) => mentorApi.connect(mentorId),
    onSuccess: () => {
      toast.success("Connection request sent");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send request"),
  });

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}, {data?.userName?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Let's continue your learning journey today.</p>
      </div>

      {isLoading && (
        <div className="min-h-[40vh] grid place-items-center text-muted-foreground">
          <div className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> Loading your dashboard…</div>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="size-4" /> {error instanceof Error ? error.message : "Failed to load dashboard."}
        </div>
      )}

      {data && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Mentors Connected" value={data.mentorsConnected} tone="bg-info/15 text-info" />
            <StatCard icon={BookOpen} label="Resources Saved" value={data.resourcesSaved} tone="bg-warning/15 text-warning" />
            <StatCard icon={MessagesSquare} label="Forum Interactions" value={data.forumInteractions} tone="bg-destructive/15 text-destructive" />
            <StatCard icon={Trophy} label="Community Points" value={data.communityPoints} tone="bg-accent text-primary" />
          </div>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recommended for you</h2>
              <Link to="/mentorship" className="text-sm text-primary font-medium">View all</Link>
            </div>
            {data.recommendedMentors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No mentors available yet. Check back soon.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.recommendedMentors.map((m: ProfileResponse) => (
                  <div key={m.id} className="rounded-2xl border border-border bg-card p-5 text-center">
                    <img src={avatarUrl(m.profilePictureUrl, m.id)} alt={m.name} className="size-20 rounded-full object-cover mx-auto" />
                    <div className="mt-3 font-semibold">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{titleCase(m.role)}</div>
                    <div className="text-[11px] text-muted-foreground">{m.department ?? ""}</div>
                    <div className="mt-3 flex flex-wrap justify-center gap-1 min-h-[1.5rem]">
                      {(m.skills ?? []).slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] uppercase tracking-wider rounded-full bg-accent text-primary px-2 py-0.5">{t}</span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4 rounded-full w-full"
                      disabled={connect.isPending}
                      onClick={() => connect.mutate(m.id)}
                    >
                      {connect.isPending && connect.variables === m.id ? "Sending…" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 flex items-center gap-5">
              <div className="size-14 grid place-items-center rounded-2xl bg-gradient-primary text-primary-foreground"><Rocket className="size-6" /></div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Placement Drive</div>
                {data.upcomingPlacementDrives[0] ? (
                  <>
                    <div className="font-semibold text-lg">
                      {data.upcomingPlacementDrives[0].companyName} — {data.upcomingPlacementDrives[0].role}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last date: {formatDate(data.upcomingPlacementDrives[0].applicationDeadline) || "TBA"}
                    </div>
                  </>
                ) : (
                  <div className="font-semibold text-lg">No active drives right now</div>
                )}
              </div>
              <Button asChild size="sm" className="rounded-full bg-gradient-primary text-primary-foreground">
                <Link to="/placements">View Details</Link>
              </Button>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2"><Calendar className="size-4 text-primary" /> Upcoming Drives</h3>
                <Link to="/placements" className="text-xs text-primary font-medium">View All</Link>
              </div>
              {data.upcomingPlacementDrives.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {data.upcomingPlacementDrives.map((d) => (
                    <li key={d.id} className="flex items-start gap-3">
                      <div className="rounded-lg bg-accent text-primary text-[10px] font-bold uppercase px-2 py-1 leading-tight text-center w-16">
                        {formatDate(d.applicationDeadline) || "TBA"}
                      </div>
                      <div>
                        <div className="font-medium">{d.companyName}</div>
                        <div className="text-xs text-muted-foreground">{d.role}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="mt-8">
            <TrendingTutorials skills={mySkills} limit={6} />
          </section>
        </>
      )}
    </AppShell>
  );
}
