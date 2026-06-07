import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Star, Search, Trophy, Award, Crown, Medal, Sparkles, TrendingUp,
  Users, GraduationCap, Briefcase, MessageCircle, Check, X, ChevronRight, Loader2, AlertCircle,
} from "lucide-react";
import { mentorApi, messageApi } from "@/lib/api/campus";
import { getUser } from "@/lib/auth";
import { avatarUrl } from "@/lib/ui";
import type { MentorConnection, MentorResponse } from "@/lib/api/types";

export const Route = createFileRoute("/mentorship")({
  head: () => ({ meta: [{ title: "Mentorship Hub · CampusBridge" }] }),
  component: Mentorship,
});

type Tier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Hall of Fame";

const tierStyle: Record<Tier, { bg: string; ring: string; text: string; icon: typeof Trophy }> = {
  Bronze:         { bg: "from-amber-700/20 to-amber-500/10",   ring: "ring-amber-600/40",   text: "text-amber-700",   icon: Medal },
  Silver:         { bg: "from-slate-400/25 to-slate-300/10",   ring: "ring-slate-400/50",   text: "text-slate-500",   icon: Award },
  Gold:           { bg: "from-yellow-400/30 to-amber-300/10",  ring: "ring-yellow-500/50",  text: "text-yellow-600",  icon: Trophy },
  Platinum:       { bg: "from-cyan-300/25 to-indigo-300/10",   ring: "ring-cyan-400/50",    text: "text-cyan-600",    icon: Sparkles },
  "Hall of Fame": { bg: "from-fuchsia-500/25 to-violet-500/10", ring: "ring-fuchsia-500/60", text: "text-fuchsia-600", icon: Crown },
};

const TIER_REQ: Record<Tier, string> = {
  Bronze: "New mentor · building reputation",
  Silver: "15+ impact · 4.5★",
  Gold: "40+ impact · 4.7★",
  Platinum: "80+ impact · 4.8★",
  "Hall of Fame": "150+ impact · legacy mentor",
};

/** Impact is derived from real rating + reviews (no fabricated data). */
function impactOf(m: MentorResponse): number {
  return Math.round((m.rating ?? 0) * 10 + (m.reviewCount ?? 0));
}
function tierOf(impact: number): Tier {
  if (impact >= 150) return "Hall of Fame";
  if (impact >= 80) return "Platinum";
  if (impact >= 40) return "Gold";
  if (impact >= 15) return "Silver";
  return "Bronze";
}

function TierBadge({ tier, size = "sm" }: { tier: Tier; size?: "sm" | "md" }) {
  const t = tierStyle[tier];
  const Icon = t.icon;
  const sz = size === "md" ? "text-xs px-3 py-1.5" : "text-[10px] px-2 py-1";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-gradient-to-r ${t.bg} ring-1 ${t.ring} ${t.text} ${sz} backdrop-blur`}>
      <Icon className={size === "md" ? "size-3.5" : "size-3"} /> {tier}
    </span>
  );
}

function Mentorship() {
  const user = getUser();
  const isMentor = user?.role === "mentor";
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [tierFilter, setTierFilter] = useState<"All" | Tier>("All");
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());

  const mentorsQ = useQuery({
    queryKey: ["mentors", keyword],
    queryFn: () => mentorApi.list({ keyword: keyword || undefined }),
    enabled: !isMentor,
  });
  const connectionsQ = useQuery({ queryKey: ["mentor-connections"], queryFn: mentorApi.connections });
  const pendingQ = useQuery({ queryKey: ["mentor-pending"], queryFn: mentorApi.pending, enabled: isMentor });

  const connect = useMutation({
    mutationFn: (mentorId: number) => mentorApi.connect(mentorId),
    onMutate: (mentorId: number) => {
      // Optimistically mark this mentor as "requested" so the button updates instantly.
      setRequestedIds((prev) => new Set(prev).add(mentorId));
    },
    onSuccess: () => { toast.success("Connection request sent"); queryClient.invalidateQueries({ queryKey: ["mentor-connections"] }); },
    onError: (e, mentorId) => {
      // Roll back optimistic state on failure (unless it failed because already sent).
      const msg = e instanceof Error ? e.message : "Could not send request";
      if (!/already/i.test(msg)) {
        setRequestedIds((prev) => {
          const next = new Set(prev);
          next.delete(mentorId);
          return next;
        });
      }
      toast.error(msg);
    },
  });
  const respond = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "reject" }) =>
      action === "accept" ? mentorApi.acceptRequest(id) : mentorApi.rejectRequest(id),
    onSuccess: (_d, v) => {
      toast.success(v.action === "accept" ? "Request accepted" : "Request rejected");
      queryClient.invalidateQueries({ queryKey: ["mentor-pending"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-connections"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Action failed"),
  });
  const startChat = useMutation({
    mutationFn: (recipientId: number) => messageApi.startConversation(recipientId),
    onSuccess: () => navigate({ to: "/chat" }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not open chat"),
  });

  const mentors = mentorsQ.data ?? [];
  const connections = connectionsQ.data ?? [];
  const pending = pendingQ.data ?? [];

  // Mentor user-ids the student has already requested/connected with (any status).
  const connectedMentorIds = useMemo(
    () => new Set(connections.map((c) => c.mentorId)),
    [connections],
  );
  const isRequested = (mentorId: number) =>
    requestedIds.has(mentorId) || connectedMentorIds.has(mentorId);

  const ranked = useMemo(
    () => [...mentors].map((m) => ({ m, impact: impactOf(m), tier: tierOf(impactOf(m)) }))
      .sort((a, b) => b.impact - a.impact),
    [mentors],
  );
  const leaderboard = ranked.slice(0, 5);
  const visibleMentors = tierFilter === "All" ? ranked : ranked.filter((r) => r.tier === tierFilter);
  const avgRating = mentors.length
    ? (mentors.reduce((s, m) => s + (m.rating ?? 0), 0) / mentors.length).toFixed(1)
    : "—";

  return (
    <AppShell title="Mentorship Hub" subtitle="Discover, learn from, and celebrate the alumni shaping MGR's next generation.">
      {/* Impact Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8 mb-8">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-accent rounded-full px-3 py-1">
              <Sparkles className="size-3" /> Mentorship Impact · 2024–25
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              {isMentor ? (
                <>Guide your <span className="text-gradient-primary">mentees</span>.</>
              ) : (
                <>Where alumni shape <span className="text-gradient-primary">careers</span>.</>
              )}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              {isMentor
                ? "Review connection requests and support the students who reached out to you."
                : "Mentors earn recognition tiers from real ratings and community reviews."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {isMentor ? (
              <Stat icon={Users} label="Your Mentees" value={connections.filter((c) => c.status === "ACCEPTED").length} />
            ) : (
              <Stat icon={Users} label="Active Mentors" value={mentors.length} accent="from-primary/20 to-primary/0" />
            )}
            <Stat icon={GraduationCap} label="Your Connections" value={connections.length} />
            <Stat icon={Briefcase} label={isMentor ? "Pending Requests" : "Pending"} value={isMentor ? pending.length : connections.filter((c) => c.status === "PENDING").length} />
            <Stat icon={Star} label="Avg Mentor Rating" value={avgRating} />
          </div>
        </div>
      </section>

      {/* Mentor: incoming requests */}
      {isMentor && (
        <section className="mb-8">
          <h3 className="font-semibold mb-3">Connection Requests</h3>
          {pendingQ.isLoading ? <Loading /> : pending.length === 0 ? (
            <Empty text="No pending requests." />
          ) : (
            <div className="space-y-3">
              {pending.map((c: MentorConnection) => (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                  <img src={avatarUrl(undefined, c.studentEmail)} alt="" className="size-11 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{c.studentName}</div>
                    <div className="text-xs text-muted-foreground">{c.studentEmail}</div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full" disabled={respond.isPending} onClick={() => respond.mutate({ id: c.id, action: "reject" })}><X className="size-3.5" /> Reject</Button>
                  <Button size="sm" className="rounded-full bg-success text-white hover:opacity-95" disabled={respond.isPending} onClick={() => respond.mutate({ id: c.id, action: "accept" })}><Check className="size-3.5" /> Accept</Button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Connections / mentees */}
      <section className="mb-10">
        <h3 className="font-semibold mb-3">{isMentor ? "Your Mentees & Connections" : "Your Mentors"}</h3>
        {connectionsQ.isLoading ? <Loading /> : connections.length === 0 ? (
          <Empty text={isMentor ? "No mentees yet. Accept requests to grow your network." : "No mentors yet. Connect with one below to get started."} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((c: MentorConnection) => {
              const other = isMentor
                ? { name: c.studentName, email: c.studentEmail, id: c.studentId, pic: undefined as string | undefined }
                : { name: c.mentorName, email: c.mentorEmail, id: c.mentorId, pic: c.mentorProfilePicture };
              return (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3">
                  <img src={avatarUrl(other.pic, other.email)} alt="" className="size-12 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{other.name}</div>
                    <span className={`text-[10px] uppercase rounded-full px-2 py-0.5 ${c.status === "ACCEPTED" ? "bg-success/15 text-success" : c.status === "PENDING" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>{c.status}</span>
                  </div>
                  {c.status === "ACCEPTED" && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => startChat.mutate(other.id)}><MessageCircle className="size-3.5" /></Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Leaderboard + Recognition tiers (students) */}
      {!isMentor && (
        <>
          <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5 mb-10">
            <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="size-9 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Trophy className="size-4" /></div>
                  <div>
                    <h3 className="font-semibold">Top Mentors Leaderboard</h3>
                    <p className="text-xs text-muted-foreground">Ranked by impact · rating · reviews</p>
                  </div>
                </div>
              </div>
              {mentorsQ.isLoading ? <Loading /> : leaderboard.length === 0 ? (
                <Empty text="No mentors yet." />
              ) : (
                <div className="divide-y divide-border">
                  {leaderboard.map((r, i) => (
                    <div key={r.m.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                      <div className={`size-8 grid place-items-center rounded-lg font-bold text-sm ${i === 0 ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{i + 1}</div>
                      <img src={avatarUrl(r.m.profilePicture, r.m.id)} alt="" className="size-11 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-semibold text-sm truncate">{r.m.name}</div>
                          <TierBadge tier={r.tier} />
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {(r.m.currentRole || r.m.currentCompany)
                            ? [r.m.currentRole, r.m.currentCompany].filter(Boolean).join(" at ")
                            : ([r.m.designation, r.m.company].filter(Boolean).join(" · ") || "Mentor")}
                        </div>
                      </div>
                      <div className="hidden sm:flex gap-5 text-center text-xs">
                        <div><div className="font-bold text-foreground flex items-center gap-1 justify-center"><Star className="size-3 fill-warning text-warning" />{(r.m.rating ?? 0).toFixed(1)}</div><div className="text-muted-foreground">rating</div></div>
                        <div><div className="font-bold text-foreground">{r.m.reviewCount ?? 0}</div><div className="text-muted-foreground">reviews</div></div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gradient-primary">{r.impact}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">impact</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-9 grid place-items-center rounded-xl bg-accent text-primary"><Crown className="size-4" /></div>
                <div>
                  <h3 className="font-semibold">Recognition Tiers</h3>
                  <p className="text-xs text-muted-foreground">Earn your badge through real impact</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {(Object.keys(tierStyle) as Tier[]).map((tier) => {
                  const t = tierStyle[tier]; const Icon = t.icon;
                  return (
                    <div key={tier} className={`flex items-center gap-3 rounded-2xl p-3 bg-gradient-to-r ${t.bg} ring-1 ${t.ring}`}>
                      <div className={`size-10 grid place-items-center rounded-xl bg-card/70 ${t.text}`}><Icon className="size-5" /></div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${t.text}`}>{tier}</div>
                        <div className="text-[11px] text-muted-foreground">{TIER_REQ[tier]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Search + tier filters */}
          <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-2 mb-4">
            <Search className="size-4 text-muted-foreground ml-2" />
            <form className="flex-1 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); setKeyword(search.trim()); }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, company, skill…" className="flex-1 bg-transparent outline-none text-sm py-1.5" />
              <Button type="submit" className="rounded-full bg-gradient-primary text-primary-foreground">Find Mentor</Button>
            </form>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {(["All", "Hall of Fame", "Platinum", "Gold", "Silver", "Bronze"] as const).map((t) => (
              <button key={t} onClick={() => setTierFilter(t)} className={`text-xs rounded-full px-3 py-1.5 font-medium border ${tierFilter === t ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>

          {/* Mentor cards */}
          <section className="mb-4">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Meet Your Mentors</h2>
                <p className="text-xs text-muted-foreground">Tiers reflect verified ratings and reviews.</p>
              </div>
            </div>
            {mentorsQ.isLoading ? <Loading /> : mentorsQ.isError ? (
              <ErrorBox msg={mentorsQ.error instanceof Error ? mentorsQ.error.message : "Failed to load mentors."} />
            ) : visibleMentors.length === 0 ? (
              <Empty text="No mentors match this filter." />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visibleMentors.map(({ m, impact, tier }) => {
                  const t = tierStyle[tier];
                  return (
                    <div key={m.id} className="group relative rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition-all">
                      <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${t.bg}`} />
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <img src={avatarUrl(m.profilePicture, m.id)} alt="" className="size-14 rounded-full object-cover ring-2 ring-card" />
                          <div className={`absolute -bottom-1 -right-1 size-6 grid place-items-center rounded-full bg-card ring-2 ring-card ${t.text}`}>
                            <t.icon className="size-3.5" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold leading-tight truncate">{m.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{[m.designation, m.company].filter(Boolean).join(" · ") || "Mentor"}</div>
                          {(m.currentRole || m.currentCompany) && (
                            <div className="text-[11px] font-medium text-primary truncate mt-0.5">
                              {[m.currentRole, m.currentCompany].filter(Boolean).join(" at ")}
                            </div>
                          )}
                          <div className="mt-1.5"><TierBadge tier={tier} /></div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-gradient-to-br from-accent/60 to-transparent p-3 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Impact Score</div>
                          <div className="text-2xl font-bold text-gradient-primary leading-none mt-0.5">{impact}</div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-success"><TrendingUp className="size-3.5" /> {tier}</div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <MiniStat value={<span className="flex items-center justify-center gap-0.5"><Star className="size-3 fill-warning text-warning" />{(m.rating ?? 0).toFixed(1)}</span>} label="Rating" />
                        <MiniStat value={m.reviewCount ?? 0} label="Reviews" />
                        <MiniStat value={m.placedCount ?? 0} label="Placed" />
                      </div>

                      {(m.skills?.length || m.domains?.length) ? (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {[...(m.skills ?? []), ...(m.domains ?? [])].slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] uppercase rounded-full bg-accent text-primary px-2 py-0.5 font-medium">{tag}</span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => startChat.mutate(m.id)}>Message</Button>
                        {isRequested(m.id) ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled
                            className="rounded-full flex-1 bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted"
                          >
                            <Check className="size-3.5" /> Connection Sent
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="rounded-full flex-1 bg-gradient-primary text-primary-foreground"
                            disabled={connect.isPending && connect.variables === m.id}
                            onClick={() => connect.mutate(m.id)}
                          >
                            {connect.isPending && connect.variables === m.id ? (
                              <><Loader2 className="size-3.5 animate-spin" /> Sending…</>
                            ) : "Connect"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, accent = "from-accent to-transparent" }: { icon: typeof Users; label: string; value: number | string; accent?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br ${accent} p-3.5`}>
      <Icon className="size-4 text-primary" />
      <div className="text-2xl font-bold mt-1 leading-none">{typeof value === "number" ? value.toLocaleString() : value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MiniStat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-lg bg-surface py-2">
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Loading() {
  return <div className="grid place-items-center py-10 text-muted-foreground"><div className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> Loading…</div></div>;
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</div>;
}
function ErrorBox({ msg }: { msg: string }) {
  return <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive flex items-center gap-2"><AlertCircle className="size-4" /> {msg}</div>;
}
