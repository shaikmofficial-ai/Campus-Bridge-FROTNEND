import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Radar, RadarChart as ReRadarChart, PolarGrid, PolarAngleAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingTutorials } from "@/components/trending-tutorials";
import { AvatarLink } from "@/components/avatar-link";
import {
  TrendingUp, Target, BrainCircuit, Sparkles, Mail, ArrowRight,
  Trophy, Crown, Award, Star, Flame, Shield, FileText, Map, Briefcase,
  MessageSquare, Wand2, Lightbulb, Lock, ChevronRight, ArrowUpRight, Loader2, AlertCircle,
} from "lucide-react";
import { dashboardApi, profileApi, mentorApi, analyticsApi, leaderboardApi } from "@/lib/api/campus";
import { titleCase } from "@/lib/ui";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · CampusBridge" }] }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

/* ---------- Journey area chart (real PRI snapshots) ---------- */
function JourneyChart({ userId }: { userId?: number }) {
  const { data } = useQuery({
    queryKey: ["pri-snapshots", userId],
    queryFn: () => analyticsApi.snapshots(userId!),
    enabled: !!userId,
  });
  const points = (data ?? []).map((s) => ({
    date: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: s.score,
  }));
  // Friendly placeholder curve so the panel never looks empty pre-data.
  const series = points.length >= 2 ? points
    : [
        { date: "Joined", score: 10 },
        { date: "Wk 2", score: 28 },
        { date: "Wk 4", score: 45 },
        { date: "Wk 6", score: 60 },
        { date: "Now", score: points[0]?.score ?? 72 },
      ];
  return (
    <div className="h-44 mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="journeyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 4" className="stroke-border" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} width={28} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
          <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#journeyFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- Skill DNA radar ---------- */
function SkillRadar({ skills }: { skills?: string[] }) {
  // Derive simple values from the student's listed skills; fall back to a
  // balanced profile when none are set.
  const axes = ["Coding", "DSA", "Communication", "Cloud", "AI/ML", "Leadership"];
  const has = (kw: string[]) =>
    (skills ?? []).some((s) => kw.some((k) => s.toLowerCase().includes(k)));
  const data = [
    { axis: "Coding", v: has(["java", "python", "c++", "react", "code", "js"]) ? 88 : 60 },
    { axis: "DSA", v: has(["dsa", "algorithm", "data structure"]) ? 82 : 48 },
    { axis: "Communication", v: 70 },
    { axis: "Cloud", v: has(["aws", "cloud", "azure", "gcp", "docker"]) ? 78 : 52 },
    { axis: "AI/ML", v: has(["ml", "ai", "tensor", "pytorch", "data"]) ? 80 : 55 },
    { axis: "Leadership", v: 65 },
  ];
  void axes;
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <ReRadarChart data={data} outerRadius="70%">
          <PolarGrid className="stroke-border" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} />
          <Radar dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Bar({ label, value, tone, icon: Icon }: { label: string; value: number; tone: string; icon: any }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <span className="text-xs font-medium w-28 text-foreground">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-9 text-right">{value}%</span>
    </div>
  );
}

function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({ queryKey: ["dashboard"], queryFn: dashboardApi.get });
  const profileQ = useQuery({ queryKey: ["profile", "me"], queryFn: profileApi.me });
  const leaderboardQ = useQuery({ queryKey: ["leaderboard", "global"], queryFn: leaderboardApi.global });

  const me = profileQ.data;
  const mySkills = me?.skills;
  const topMentors = (leaderboardQ.data ?? []).slice(0, 3);

  const connect = useMutation({
    mutationFn: (mentorId: number) => mentorApi.connect(mentorId),
    onSuccess: () => { toast.success("Connection request sent"); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send request"),
  });

  const firstName = (data?.userName ?? me?.name ?? "there").split(" ")[0];
  const points = data?.communityPoints ?? me?.communityPoints ?? 0;
  const drive = data?.upcomingPlacementDrives?.[0];

  const heroStats = useMemo(() => ([
    { icon: TrendingUp, label: "Growth Score", value: `${Math.min(99, points)}%`, sub: "live", tone: "text-success", iconClr: "text-success" },
    { icon: Shield, label: "Level", value: `Level ${Math.max(1, Math.floor(points / 50) + 1)}`, sub: "Builder", iconClr: "text-info" },
    { icon: Flame, label: "Streak", value: "12 Days", sub: "Keep it up!", iconClr: "text-warning" },
    { icon: Trophy, label: "Rank", value: `#${leaderboardQ.data?.findIndex((e) => e.userId === me?.id) >= 0 ? (leaderboardQ.data.findIndex((e) => e.userId === me?.id) + 1) : "—"}`, sub: "Campus rank", iconClr: "text-warning" },
    { icon: Target, label: "Dream Company", value: drive?.companyName ?? "Zoho", sub: "Readiness: 62%", iconClr: "text-destructive" },
  ]), [points, leaderboardQ.data, me?.id, drive]);

  const aiActions = [
    { icon: FileText, label: "Improve my Resume", to: "/resources" },
    { icon: Map, label: "Suggest a Roadmap", to: "/learn" },
    { icon: Briefcase, label: "Find Internships", to: "/placements" },
    { icon: MessageSquare, label: "Prepare for Interviews", to: "/forum" },
    { icon: Wand2, label: "Recommend Skills", to: "/learn" },
  ] as const;

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-[50vh] grid place-items-center text-muted-foreground">
          <div className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> Loading your dashboard…</div>
        </div>
      </AppShell>
    );
  }
  if (isError) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="size-4" /> {error instanceof Error ? error.message : "Failed to load dashboard."}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid xl:grid-cols-[1fr_320px] gap-5">
        {/* LEFT COLUMN */}
        <div className="min-w-0 space-y-5">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-soft p-6 lg:p-7">
            <div className="absolute top-0 right-0 w-72 h-full pointer-events-none opacity-90 hidden md:block">
              <div className="size-full bg-gradient-primary opacity-10 blur-3xl rounded-full" />
            </div>
            <div className="relative">
              <h1 className="text-[28px] font-bold tracking-tight">{greeting()}, {firstName} 👋</h1>
              <p className="text-sm text-muted-foreground mt-1">Keep pushing forward! You're building your future every day.</p>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {heroStats.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-border bg-surface p-3.5 shadow-soft">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <s.icon className={`size-3.5 ${s.iconClr ?? "text-muted-foreground"}`} />
                      {s.label}
                    </div>
                    <div className="text-lg font-bold mt-1.5 leading-tight truncate">{s.value}</div>
                    <div className={`text-[11px] mt-0.5 ${s.tone ?? "text-muted-foreground"}`}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button onClick={() => navigate({ to: "/learn" })} className="rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-elegant">
                  Continue Journey <ArrowRight className="size-4 ml-1" />
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/profile">View My Profile</Link>
                </Button>

                <div className="ml-auto hidden lg:block rounded-2xl bg-surface border border-border shadow-soft p-3 w-64">
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" /> You're doing great!
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">{points} community points earned</div>
                  <Progress value={Math.min(100, points)} className="h-1.5 mt-2" />
                </div>
              </div>
            </div>
          </section>

          {/* ROW 1 — Journey / Dream Company / Placement Probability */}
          <section className="grid lg:grid-cols-3 gap-5">
            {/* Journey */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="size-4 text-primary" /> CampusBridge Journey
                </div>
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">Placement Readiness Index</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-gradient-primary">{points}</div>
                <div className="text-xs font-semibold text-success">live <span className="text-muted-foreground font-normal">growth score</span></div>
              </div>
              <div className="mt-2 rounded-2xl bg-surface border border-border p-2">
                <JourneyChart userId={me?.id} />
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {[
                  ["Mentors Connected", String(data?.mentorsConnected ?? 0), "bg-info"],
                  ["Resources Saved", String(data?.resourcesSaved ?? 0), "bg-primary"],
                  ["Forum Interactions", String(data?.forumInteractions ?? 0), "bg-warning"],
                  ["Skills Listed", String(mySkills?.length ?? 0), "bg-success"],
                ].map(([l, v, c]) => (
                  <li key={l} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className={`size-1.5 rounded-full ${c}`} /> {l}
                    </span>
                    <span className="font-bold tabular-nums">{v}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-2xl bg-accent/60 border border-border px-3.5 py-3">
                <p className="text-xs text-foreground leading-relaxed">
                  <Sparkles className="size-3.5 inline text-primary mr-1" />
                  <span className="font-semibold">Keep going!</span> Solve lessons in Learn Coding to grow your index.
                </p>
              </div>
            </div>

            {/* Dream Company */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="size-4 text-destructive" /> Dream Company Tracker
                </div>
                <Link to="/placements" className="text-[11px] text-primary font-semibold">View All</Link>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-card border border-border grid place-items-center font-bold text-[10px] tracking-wider text-primary">
                    {(drive?.companyName ?? "ZOHO").slice(0, 4).toUpperCase()}
                  </div>
                  <div className="font-semibold text-sm">{drive?.companyName ?? "Zoho Corporation"}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">Readiness</div>
                  <div className="text-xl font-bold text-gradient-primary">62%</div>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <Bar label="Aptitude" value={80} tone="bg-success" icon={BrainCircuit} />
                <Bar label="DSA" value={45} tone="bg-warning" icon={BrainCircuit} />
                <Bar label="Projects" value={70} tone="bg-success" icon={Briefcase} />
                <Bar label="System Design" value={40} tone="bg-warning" icon={Map} />
                <Bar label="Communication" value={75} tone="bg-success" icon={MessageSquare} />
              </div>
              <div className="mt-5 rounded-2xl bg-surface border border-border px-3.5 py-3 text-xs text-muted-foreground flex items-center gap-2">
                ⏱ Estimated readiness in <span className="font-semibold text-foreground">6 months</span>
              </div>
            </div>

            {/* Placement Probability */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BrainCircuit className="size-4 text-primary" /> Placement Probability
                </div>
                <span className="rounded-full bg-accent text-primary text-[10px] font-semibold px-2 py-0.5">AI-Powered</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { l: "Service Companies", v: 90, t: "High Chance", tone: "text-success", border: "border-success/30 bg-success/10" },
                  { l: "Product Companies", v: 65, t: "Good Chance", tone: "text-info", border: "border-info/30 bg-info/10" },
                  { l: "Startups", v: 80, t: "High Chance", tone: "text-success", border: "border-success/30 bg-success/10" },
                  { l: "Core Companies", v: 50, t: "Moderate", tone: "text-warning", border: "border-warning/30 bg-warning/10" },
                ].map((c) => (
                  <div key={c.l} className={`rounded-2xl border ${c.border} p-3.5`}>
                    <div className="text-[11px] text-muted-foreground font-medium">{c.l}</div>
                    <div className={`text-2xl font-bold mt-1 ${c.tone}`}>{c.v}%</div>
                    <div className={`text-[11px] mt-0.5 ${c.tone} font-medium`}>{c.t}</div>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-4 w-full rounded-xl">
                <Link to="/placements">View Detailed Analysis <ArrowRight className="size-4 ml-1" /></Link>
              </Button>
            </div>
          </section>

          {/* ROW 2 — Career Wrapped / Future Me / Top Mentors */}
          <section className="grid lg:grid-cols-3 gap-5">
            {/* Career Wrapped */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="size-4 text-primary" /> Career Wrapped 2026
                </div>
                <span className="text-[10px] font-semibold rounded-full bg-accent text-primary px-2 py-0.5">Preview</span>
              </div>
              <div className="relative overflow-hidden rounded-2xl p-5 text-white"
                style={{ background: "linear-gradient(135deg,#0b1e54 0%,#3b1e8a 50%,#6b21a8 100%)" }}>
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl font-extrabold tracking-tight">2026</div>
                    <Button size="sm" className="rounded-full bg-white text-violet-900 hover:bg-white/90 text-xs h-7">See Full Wrap</Button>
                  </div>
                  <p className="text-xs opacity-90 mt-1">Your year. Your growth. Your story.</p>
                  <div className="mt-5 grid grid-cols-4 gap-2 text-xs">
                    {[
                      ["⚡", "Points", String(points)],
                      ["🛡️", "Level", String(Math.floor(points / 50) + 1)],
                      ["💬", "Forum", String(data?.forumInteractions ?? 0)],
                      ["👥", "Mentors", String(data?.mentorsConnected ?? 0)],
                    ].map(([e, l, v]) => (
                      <div key={l}>
                        <div className="text-base">{e}</div>
                        <div className="text-[9px] opacity-75 mt-1 leading-tight">{l}</div>
                        <div className="font-bold text-base">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="text-[10px] opacity-70">Top Skill</div>
                    <div className="font-bold text-sm">{mySkills?.[0] ?? "Python"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Me Letter */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft flex flex-col">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="size-4 text-destructive" /> Future Me Letter
              </div>
              <p className="text-xs text-muted-foreground mt-2">Your future self is waiting!</p>
              <div className="mt-4 rounded-2xl border border-border bg-surface p-3.5">
                <div className="text-[10px] text-muted-foreground">You wrote a letter on</div>
                <div className="text-sm font-bold mt-0.5">📜 06 June 2026</div>
              </div>
              <div className="mt-3 rounded-2xl border border-border bg-surface p-3.5">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Lock className="size-3" /> Unlocks on
                </div>
                <div className="text-sm font-bold mt-0.5">🔒 06 June 2027</div>
              </div>
              <div className="flex-1" />
              <Button variant="outline" className="mt-4 w-full rounded-xl">View Letter</Button>
            </div>

            {/* Top Mentors Leaderboard */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy className="size-4 text-warning" /> Top Mentors Leaderboard
                </div>
                <Link to="/leaderboard" className="text-[11px] text-primary font-semibold flex items-center">View All <ChevronRight className="size-3" /></Link>
              </div>
              {leaderboardQ.isLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="size-4 animate-spin" /> Loading…</div>
              ) : topMentors.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No ranked members yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {topMentors.map((m, i) => {
                    const rankClr = i === 0 ? "bg-warning" : i === 1 ? "bg-muted-foreground" : "bg-amber-600";
                    const Icon = i === 0 ? Crown : Award;
                    return (
                      <li key={m.userId} className="flex items-center gap-3">
                        <div className={`size-7 grid place-items-center rounded-full ${rankClr} text-white text-xs font-bold`}>{m.rank}</div>
                        <AvatarLink userId={m.userId} picture={m.profilePictureUrl} seed={m.userId} size={80} className="size-10 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{m.name}</div>
                          <div className="inline-flex items-center gap-1 mt-0.5 rounded-full bg-accent text-primary text-[10px] font-semibold px-2 py-0.5">
                            <Icon className="size-2.5" /> {m.lessonsSolved} solved
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-muted-foreground">Points</div>
                          <div className="text-sm font-bold tabular-nums flex items-center justify-end gap-1">
                            {m.totalPoints}
                            <Star className="size-3 fill-warning text-warning ml-1" />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Recommended mentors (real data + connect) */}
          {data && data.recommendedMentors.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recommended for you</h2>
                <Link to="/mentorship" className="text-sm text-primary font-medium">View all</Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.recommendedMentors.map((m) => (
                  <div key={m.id} className="rounded-2xl border border-border bg-card p-5 text-center shadow-soft">
                    <div className="flex justify-center">
                      <AvatarLink userId={m.id} picture={m.profilePictureUrl} seed={m.id} size={160} className="size-20 rounded-full" />
                    </div>
                    <div className="mt-3 font-semibold">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{titleCase(m.role)}</div>
                    <div className="text-[11px] text-muted-foreground">{m.department ?? ""}</div>
                    <Button size="sm" variant="outline" className="mt-4 rounded-full w-full"
                      disabled={connect.isPending} onClick={() => connect.mutate(m.id)}>
                      {connect.isPending && connect.variables === m.id ? "Sending…" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trending tutorials */}
          <section>
            <TrendingTutorials skills={mySkills} limit={6} />
          </section>
        </div>

        {/* RIGHT RAIL */}
        <aside className="space-y-5">
          {/* AI Assistant */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <div className="size-8 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1">CampusBridge AI <Sparkles className="size-3 text-warning" /></div>
                <div className="text-[11px] text-muted-foreground">Your personal career assistant</div>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground mt-4 mb-2">How can I help you today?</div>
            <div className="space-y-1.5">
              {aiActions.map((a) => (
                <Link key={a.label} to={a.to}
                  className="w-full flex items-center gap-3 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/40 px-3 py-2.5 text-[13px] font-medium text-left transition-colors">
                  <a.icon className="size-4 text-primary" />
                  <span className="flex-1">{a.label}</span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
            <Button asChild className="w-full mt-4 rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-elegant">
              <Link to="/forum"><Sparkles className="size-4 mr-1.5" /> Chat with AI</Link>
            </Button>
          </div>

          {/* Skill DNA */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BrainCircuit className="size-4 text-primary" /> Skill DNA
              </div>
              <Link to="/profile" className="text-[11px] text-primary font-semibold">View Full</Link>
            </div>
            <SkillRadar skills={mySkills} />
            <div className="mt-2 rounded-2xl bg-warning/10 border border-warning/30 px-3 py-2.5 text-[11px] flex items-start gap-2">
              <Lightbulb className="size-4 text-warning shrink-0 mt-0.5" />
              <span><span className="font-semibold">Tip:</span> Focus more on DSA &amp; System Design</span>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
