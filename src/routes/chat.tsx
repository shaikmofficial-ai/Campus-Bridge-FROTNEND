import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Send, Search, Loader2, MessageSquare, Flag, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { messageApi, profileApi, reportApi } from "@/lib/api/campus";
import { isConversationGroup } from "@/lib/api/normalize";
import { avatarUrl, formatTime } from "@/lib/ui";
import type { Conversation } from "@/lib/api/types";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Messages · CampusBridge" }] }),
  component: Chat,
});

function conversationTitle(c: Conversation, myId?: number): { name: string; pic?: string; seed: string } {
  if (isConversationGroup(c)) return { name: c.groupName || "Group", seed: `g${c.id}` };
  const other = c.participants?.find((p) => p.id !== myId) ?? c.participants?.[0];
  return { name: other?.name ?? "Conversation", pic: other?.profilePicture, seed: other?.name ?? `c${c.id}` };
}

function Chat() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const meQ = useQuery({ queryKey: ["profile", "me"], queryFn: profileApi.me });
  const myId = meQ.data?.id;

  const convosQ = useQuery({
    queryKey: ["conversations"],
    queryFn: messageApi.conversations,
    refetchInterval: 15000,
  });
  const conversations = convosQ.data ?? [];

  // Auto-select first conversation
  useEffect(() => {
    if (activeId === null && conversations.length > 0) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  const messagesQ = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => messageApi.messages(activeId!),
    enabled: activeId !== null,
    refetchInterval: 8000,
  });
  const messages = messagesQ.data ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = useMutation({
    mutationFn: () => messageApi.send(activeId!, draft.trim()),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["messages", activeId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send message"),
  });

  const filtered = conversations.filter((c) =>
    conversationTitle(c, myId).name.toLowerCase().includes(search.toLowerCase()),
  );
  const active = conversations.find((c) => c.id === activeId) ?? null;
  const activeMeta = active ? conversationTitle(active, myId) : null;
  const otherParticipant = active && !isConversationGroup(active)
    ? active.participants?.find((p) => p.id !== myId)
    : undefined;

  const pendingApproval =
    !!meQ.data && meQ.data.role !== "ADMIN" && meQ.data.accountStatus !== "APPROVED";

  if (pendingApproval) {
    return (
      <AppShell title="Messages" subtitle="Secure chat with mentors, peers and groups.">
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center max-w-xl mx-auto">
          <div className="size-12 grid place-items-center rounded-2xl bg-warning/15 text-warning mx-auto mb-4">
            <Lock className="size-6" />
          </div>
          <h2 className="text-lg font-semibold">Chat is locked</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Your account is pending admin approval. Once an admin approves you, you'll be able to
            message mentors and peers you're connected with.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Messages" subtitle="Secure chat with mentors, peers and groups.">
      <p className="text-xs text-muted-foreground mb-3">
        You can only chat with people you're connected with. Send a request from the Mentors page first.
      </p>
      <div className="rounded-3xl border border-border bg-card overflow-hidden grid md:grid-cols-[320px_1fr] min-h-[560px]">
        <aside className="border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations…" className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convosQ.isLoading ? (
              <div className="p-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="size-4 animate-spin" /> Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No conversations yet. Start one from the Mentors page.
              </div>
            ) : (
              filtered.map((c) => {
                const meta = conversationTitle(c, myId);
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border/60 ${activeId === c.id ? "bg-accent/50" : "hover:bg-muted/60"}`}
                  >
                    <img src={avatarUrl(meta.pic, meta.seed)} alt="" className="size-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold truncate">{meta.name}</div>
                        <div className="text-[10px] text-muted-foreground">{formatTime(c.lastMessageAt)}</div>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{c.lastMessage || "No messages yet"}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex flex-col">
          {active && activeMeta ? (
            <>
              <header className="px-5 py-3 border-b border-border flex items-center gap-3">
                <img src={avatarUrl(activeMeta.pic, activeMeta.seed)} alt="" className="size-10 rounded-full object-cover" />
                <div className="font-semibold text-sm flex-1">{activeMeta.name}</div>
                {otherParticipant && (
                  <button
                    onClick={() => setReportOpen(true)}
                    className="size-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground hover:text-destructive"
                    aria-label="Report user"
                    title="Report user"
                  >
                    <Flag className="size-4" />
                  </button>
                )}
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-surface">
                {messagesQ.isLoading ? (
                  <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2 py-6"><Loader2 className="size-4 animate-spin" /> Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-6">No messages yet. Say hello!</div>
                ) : (
                  messages.map((m) => {
                    const mine = myId !== undefined && m.senderId === myId;
                    return (
                      <div key={m.id} className={`max-w-[70%] ${mine ? "ml-auto" : ""}`}>
                        <div className={`rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-gradient-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                          {m.content}
                        </div>
                        <div className={`text-[10px] text-muted-foreground mt-1 ${mine ? "text-right" : ""}`}>
                          {!mine && <span className="mr-1 font-medium">{m.senderName}</span>}
                          {formatTime(m.sentAt)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <footer className="p-3 border-t border-border flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && draft.trim() && !send.isPending) send.mutate(); }}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none"
                />
                <button
                  onClick={() => draft.trim() && send.mutate()}
                  disabled={!draft.trim() || send.isPending}
                  className="size-10 grid place-items-center rounded-full bg-gradient-primary text-primary-foreground disabled:opacity-50"
                >
                  {send.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
              </footer>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {otherParticipant && (
        <ReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          userId={otherParticipant.id}
          userName={otherParticipant.name}
        />
      )}
    </AppShell>
  );
}

function ReportDialog({
  open, onOpenChange, userId, userName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: number;
  userName: string;
}) {
  const [reason, setReason] = useState("Spam");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: () => reportApi.create({ reportedUserId: userId, reason, description: description.trim() || undefined }),
    onSuccess: () => {
      toast.success("Report submitted to the moderation team");
      setDescription("");
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not submit report"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report {userName}</DialogTitle>
          <DialogDescription>Reports are reviewed by administrators.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {["Spam", "Harassment", "Inappropriate", "Misinformation", "Other"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-description">Details (optional)</Label>
            <Textarea id="r-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What happened?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="bg-destructive text-white hover:opacity-95">
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Submitting…</> : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
