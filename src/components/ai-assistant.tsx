import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Send, Bot } from "lucide-react";
import { aiApi, type AiActionType } from "@/lib/api/campus";

/** Minimal, safe markdown -> HTML for headings, bold, and bullet lists. */
function renderMarkdown(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = esc(md).split("\n");
  let html = "";
  let inList = false;
  const inline = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="px-1 rounded bg-muted">$1</code>');
  for (const raw of lines) {
    const line = raw.trim();
    if (/^[-*]\s+/.test(line)) {
      if (!inList) { html += '<ul class="list-disc pl-5 space-y-1 my-2">'; inList = true; }
      html += `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }
    if (inList) { html += "</ul>"; inList = false; }
    if (/^###\s+/.test(line)) html += `<h3 class="font-bold text-sm mt-3 mb-1">${inline(line.replace(/^###\s+/, ""))}</h3>`;
    else if (/^##\s+/.test(line)) html += `<h2 class="font-bold mt-3 mb-1">${inline(line.replace(/^##\s+/, ""))}</h2>`;
    else if (/^\d+\.\s+/.test(line)) html += `<p class="my-1">${inline(line)}</p>`;
    else if (line === "") html += "";
    else html += `<p class="my-1.5 leading-relaxed">${inline(line)}</p>`;
  }
  if (inList) html += "</ul>";
  return html;
}

const ACTION_TITLES: Record<AiActionType, string> = {
  resume: "Improve my Resume",
  roadmap: "Suggest a Roadmap",
  interview: "Prepare for Interviews",
  internships: "Find Internships",
  skills: "Recommend Skills",
  chat: "Chat with CampusBridge AI",
};

/** Quick-action result modal. */
export function AiActionModal({
  action, open, onOpenChange,
}: {
  action: AiActionType | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [content, setContent] = useState("");

  const run = useMutation({
    mutationFn: (a: AiActionType) => aiApi.action(a),
    onSuccess: (res) => setContent(res.result),
    onError: () => setContent("CampusBridge AI is briefly unavailable. Please try again in a moment."),
  });

  useEffect(() => {
    if (open && action) {
      setContent("");
      run.mutate(action);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, action]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="size-7 grid place-items-center rounded-lg bg-gradient-primary text-primary-foreground"><Sparkles className="size-4" /></span>
            {action ? ACTION_TITLES[action] : "CampusBridge AI"}
          </DialogTitle>
          <DialogDescription>Personalized using your live dashboard metrics.</DialogDescription>
        </DialogHeader>

        <div className="min-h-[160px] max-h-[55vh] overflow-y-auto rounded-2xl border border-border bg-surface p-4 text-sm text-foreground">
          {run.isPending ? (
            <div className="h-40 grid place-items-center text-center text-muted-foreground">
              <div>
                <Loader2 className="size-6 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-sm font-medium">CampusBridge AI is analyzing your Skill DNA…</p>
              </div>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ChatMsg = { role: "user" | "ai"; text: string };

/** Conversational chat panel. */
export function AiChatModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "ai", text: "Hi! I'm **CampusBridge AI**, your career assistant. Ask me about resumes, roadmaps, interviews, or skills." },
  ]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = useMutation({
    mutationFn: (msg: string) => aiApi.action("chat", msg),
    onSuccess: (res) => setMessages((m) => [...m, { role: "ai", text: res.result }]),
    onError: () => setMessages((m) => [...m, { role: "ai", text: "I'm briefly offline — but keep solving 2-3 DSA problems daily and your readiness will climb steadily!" }]),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, send.isPending]);

  const submit = () => {
    const text = draft.trim();
    if (!text || send.isPending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setDraft("");
    send.mutate(text);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="size-7 grid place-items-center rounded-lg bg-gradient-primary text-primary-foreground"><Bot className="size-4" /></span>
            CampusBridge AI
          </DialogTitle>
          <DialogDescription>Your personal career assistant</DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="h-[50vh] overflow-y-auto rounded-2xl border border-border bg-surface p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : ""}`}>
              <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "bg-gradient-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
              </div>
            </div>
          ))}
          {send.isPending && (
            <div className="max-w-[85%]">
              <div className="rounded-2xl rounded-bl-sm bg-card border border-border px-3.5 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Ask CampusBridge AI…"
            className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none"
          />
          <button onClick={submit} disabled={!draft.trim() || send.isPending}
            className="size-10 grid place-items-center rounded-full bg-gradient-primary text-primary-foreground disabled:opacity-50">
            {send.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
