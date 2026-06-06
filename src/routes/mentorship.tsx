import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Star, Search, Users, GraduationCap, Briefcase, Building2, Loader2, AlertCircle,
  Check, X, MessageCircle,
} from "lucide-react";
import { mentorApi, messageApi } from "@/lib/api/campus";
import { getUser } from "@/lib/auth";
import { avatarUrl } from "@/lib/ui";
import type { MentorConnection, MentorResponse } from "@/lib/api/types";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/mentorship")({
  head: () => ({ meta: [{ title: "Mentorship Hub · CampusBridge" }] }),
  component: Mentorship,
});

function Mentorship() {
  const user = getUser();
  const isMentor = user?.role === "mentor";
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const mentorsQ = useQuery({
    queryKey: ["mentors", keyword],
    queryFn: () => mentorApi.list({ keyword: keyword || undefined }),
    enabled: !isMentor,
  });
  const connectionsQ = useQuery({ queryKey: ["mentor-connections"], queryFn: mentorApi.connections });
  const pendingQ = useQuery({
    queryKey: ["mentor-pending"],
    queryFn: mentorApi.pending,
    enabled: isMentor,
  });

  const connect = useMutation({
    mutationFn: (mentorId: number) => mentorApi.connect(mentorId),
    onSuccess: () => {
      toast.success("Connection request sent");
      queryClient.invalidateQueries({ queryKey: ["mentor-connections"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send request"),
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

  return (
    <AppShell title="Mentorship Hub" subtitle="Discover alumni mentors, connect, and grow your network.">
      {/* Summary banner */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8 mb-8">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-6 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {isMentor ? (
                <>Guide your <span className="text-gradient-primary">mentees</span>.</>
              ) : (
                <>Find your next <span className="text-gradient-primary">mentor</span>.</>
              )}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              {isMentor
                ? "Review connection requests and support the students who reached out to you."
                : "Connect with experienced alumni and seniors who can guide your journey."}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {isMentor ? (
              <Stat icon={Users} label="Mentees" value={connections.filter((c) => c.status === "ACCEPTED").length} />
            ) : (
              <Stat icon={Users} label="Mentors" value={mentors.length} />
            )}
            <Stat icon={GraduationCap} label="Connections" value={connections.length} />
            <Stat icon={Briefcase} label={isMentor ? "Requests" : "Pending"} value={isMentor ? pending.length : connections.filter((c) => c.status === "PENDING").length} />
          </div>
        </div>
      </section>

      {/* Mentor (incoming) requests */}
      {isMentor && (
        <section className="mb-8">
          <h3 className="font-semibold mb-3">Connection Requests</h3>
          {pendingQ.isLoading ? (
            <Loading />
          ) : pending.length === 0 ? (
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
                  <Button size="sm" variant="outline" className="rounded-full" disabled={respond.isPending}
                    onClick={() => respond.mutate({ id: c.id, action: "reject" })}>
                    <X className="size-3.5" /> Reject
                  </Button>
                  <Button size="sm" className="rounded-full bg-success text-white hover:opacity-95" disabled={respond.isPending}
                    onClick={() => respond.mutate({ id: c.id, action: "accept" })}>
                    <Check className="size-3.5" /> Accept
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* My connections */}
      <section className="mb-8">
        <h3 className="font-semibold mb-3">{isMentor ? "Your Mentees & Connections" : "Your Mentors"}</h3>
        {connectionsQ.isLoading ? (
          <Loading />
        ) : connections.length === 0 ? (
          <Empty text="No connections yet. Send a request below to get started." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((c: MentorConnection) => {
              const other = isMentor
                ? { name: c.studentName, email: c.studentEmail, id: c.studentId, pic: undefined }
                : { name: c.mentorName, email: c.mentorEmail, id: c.mentorId, pic: c.mentorProfilePicture };
              return (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3">
                  <img src={avatarUrl(other.pic, other.email)} alt="" className="size-12 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{other.name}</div>
                    <span className={`text-[10px] uppercase rounded-full px-2 py-0.5 ${c.status === "ACCEPTED" ? "bg-success/15 text-success" : c.status === "PENDING" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>
                      {c.status}
                    </span>
                  </div>
                  {c.status === "ACCEPTED" && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => startChat.mutate(other.id)}>
                      <MessageCircle className="size-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Mentor discovery — students only */}
      {!isMentor && (
        <>
          {/* Search */}
          <form
            onSubmit={(e) => { e.preventDefault(); setKeyword(search.trim()); }}
            className="rounded-2xl border border-border bg-card p-3 flex items-center gap-2 mb-6"
          >
            <Search className="size-4 text-muted-foreground ml-2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, skill…"
              className="flex-1 bg-transparent outline-none text-sm py-1.5"
            />
            <Button type="submit" className="rounded-full bg-gradient-primary text-primary-foreground">Search</Button>
          </form>

          {/* Mentor directory */}
          <section>
            <h3 className="font-semibold mb-3">Meet Your Mentors</h3>
            {mentorsQ.isLoading ? (
              <Loading />
            ) : mentorsQ.isError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="size-4" /> {mentorsQ.error instanceof Error ? mentorsQ.error.message : "Failed to load mentors."}
              </div>
            ) : mentors.length === 0 ? (
              <Empty text="No mentors found. Try a different search." />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mentors.map((m: MentorResponse) => (
                  <div key={m.id} className="group relative rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition-all">
                    <div className="flex items-start gap-3">
                      <img src={avatarUrl(m.profilePicture, m.id)} alt="" className="size-14 rounded-full object-cover ring-2 ring-card" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold leading-tight truncate">{m.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {[m.designation, m.company].filter(Boolean).join(" · ") || "Mentor"}
                        </div>
                        {m.rating > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="size-3 fill-warning text-warning" /> {m.rating.toFixed(1)}
                            {m.reviewCount > 0 && <span>({m.reviewCount})</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {(m.skills?.length || m.domains?.length) ? (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {[...(m.skills ?? []), ...(m.domains ?? [])].slice(0, 4).map((tag) => (
                          <span key={tag} className="text-[10px] uppercase rounded-full bg-accent text-primary px-2 py-0.5 font-medium">{tag}</span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => startChat.mutate(m.id)}>
                        Message
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-full flex-1 bg-gradient-primary text-primary-foreground"
                        disabled={connect.isPending}
                        onClick={() => connect.mutate(m.id)}
                      >
                        Connect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-accent to-transparent p-3.5">
      <Icon className="size-4 text-primary" />
      <div className="text-2xl font-bold mt-1 leading-none">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Loading() {
  return (
    <div className="grid place-items-center py-10 text-muted-foreground">
      <div className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> Loading…</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</div>;
}
