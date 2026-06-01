import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { FileText, Video, BookOpen, Download } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resource Library · CampusBridge" }] }),
  component: Resources,
});

const items = [
  { icon: FileText, type: "Notes", title: "Data Structures Complete Notes", dept: "CSE", size: "4.2 MB" },
  { icon: Video, type: "Video", title: "OS Mock Interview Walkthrough", dept: "CSE", size: "320 MB" },
  { icon: BookOpen, type: "Book", title: "Cracking the System Design Interview", dept: "All", size: "12 MB" },
  { icon: FileText, type: "Notes", title: "DBMS End-Sem Question Bank", dept: "CSE", size: "1.8 MB" },
  { icon: Video, type: "Video", title: "Resume Building Workshop 2024", dept: "All", size: "210 MB" },
  { icon: BookOpen, type: "Book", title: "Probability & Statistics Reference", dept: "ECE", size: "8 MB" },
];

function Resources() {
  return (
    <AppShell title="Resource Library" subtitle="Curated notes, videos and books from seniors and mentors.">
      <div className="flex flex-wrap gap-2 mb-5">
        {["All", "Notes", "Videos", "Books", "Templates", "Question Banks"].map((t, i) => (
          <button key={t} className={`text-xs rounded-full px-3 py-1.5 font-medium border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((r) => (
          <div key={r.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="size-11 grid place-items-center rounded-xl bg-accent text-primary"><r.icon className="size-5" /></div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.type}</span>
            </div>
            <div className="mt-4 font-semibold leading-snug">{r.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{r.dept} · {r.size}</div>
            <Button size="sm" variant="outline" className="mt-4 rounded-full w-full"><Download className="size-3.5" /> Download</Button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
