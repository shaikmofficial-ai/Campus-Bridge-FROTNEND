import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Globe, Lock, MessageCircle, Eye, Plus } from "lucide-react";

export const Route = createFileRoute("/forum")({
  head: () => ({ meta: [{ title: "Community Forum · CampusBridge" }] }),
  component: Forum,
});

const publicPosts = [
  { t: "How to prepare for coding interviews?", a: "Arun Prakash", time: "2h ago", c: 24, v: 120, img: 11, tag: "Career" },
  { t: "Best resources for DBMS?", a: "Swathi R.", time: "5h ago", c: 18, v: 89, img: 32, tag: "Academics" },
  { t: "Share your internship experience!", a: "Vigneshwaran", time: "1d ago", c: 32, v: 150, img: 13, tag: "Internship" },
  { t: "DAA Important Topics for End Sem", a: "Nivetha S.", time: "1d ago", c: 12, v: 60, img: 47, tag: "Academics" },
  { t: "Open-source projects beginners can contribute to", a: "Rahul K.", time: "2d ago", c: 41, v: 210, img: 15, tag: "Open Source" },
];

const privateGroups = [
  { name: "CSE 2022 Batch", members: 120 },
  { name: "Placement Preparation — 2025", members: 85 },
  { name: "Alumni — CSE", members: 60 },
  { name: "Web Developers Community", members: 95 },
  { name: "Mentors Circle", members: 42 },
];

function Forum() {
  const [tab, setTab] = useState<"public" | "private">("public");
  return (
    <AppShell title="Community Forum" subtitle="Discuss, ask, share — across batches and departments.">
      <div className="rounded-2xl border border-border bg-card p-2 flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1">
          <button
            onClick={() => setTab("public")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${tab === "public" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Globe className="size-4" /> Public Forum
          </button>
          <button
            onClick={() => setTab("private")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${tab === "private" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Lock className="size-4" /> Private Forum
          </button>
        </div>
        <Button className="rounded-full bg-gradient-primary text-primary-foreground"><Plus className="size-4" /> New Post</Button>
      </div>

      {tab === "public" ? (
        <div className="space-y-3">
          {publicPosts.map((p) => (
            <div key={p.t} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:shadow-soft transition-shadow">
              <img src={`https://i.pravatar.cc/80?img=${p.img}`} alt="" className="size-11 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider rounded-full bg-accent text-primary px-2 py-0.5">{p.tag}</span>
                </div>
                <div className="mt-1 font-semibold truncate">{p.t}</div>
                <div className="text-xs text-muted-foreground">{p.a} · {p.time}</div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground tabular-nums">
                <span className="flex items-center gap-1"><MessageCircle className="size-3.5" /> {p.c}</span>
                <span className="flex items-center gap-1"><Eye className="size-3.5" /> {p.v}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {privateGroups.map((g) => (
            <div key={g.name} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <div className="size-12 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Lock className="size-5" /></div>
              <div className="flex-1">
                <div className="font-semibold">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.members} members · invite-only</div>
              </div>
              <Button size="sm" variant="outline" className="rounded-full">Open</Button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
