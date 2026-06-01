import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Calendar, Building2 } from "lucide-react";

export const Route = createFileRoute("/placements")({
  head: () => ({ meta: [{ title: "Placement Hub · CampusBridge" }] }),
  component: Placements,
});

const drives = [
  { co: "Zoho", role: "Software Engineer", pkg: "8 LPA", date: "15 May 2025", batch: "2025", status: "Open" },
  { co: "Microsoft", role: "SDE Intern", pkg: "1L /mo", date: "20 May 2025", batch: "2026", status: "Open" },
  { co: "Deloitte", role: "Data Analyst", pkg: "7 LPA", date: "30 May 2025", batch: "2025", status: "Closing" },
  { co: "Flipkart", role: "Product Designer", pkg: "12 LPA", date: "05 Jun 2025", batch: "2025", status: "Open" },
];

const stories = [
  { name: "Arun Prakash", co: "Zoho", text: "Focus on DSA fundamentals — Zoho rounds heavily test arrays and strings.", img: 11 },
  { name: "Swathi R.", co: "Deloitte", text: "Behavioral interviews matter as much as the case study. Practice STAR.", img: 32 },
  { name: "Vigneshwaran", co: "Microsoft", text: "System design is now expected even for intern roles — read Grokking.", img: 13 },
];

function Placements() {
  return (
    <AppShell title="Placement Experience Hub" subtitle="Drives, prep guides and stories from those who've been there.">
      <section>
        <h2 className="text-lg font-semibold mb-3">Active Drives</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {drives.map((d) => (
            <div key={d.co} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <div className="size-12 grid place-items-center rounded-xl bg-accent text-primary"><Building2 className="size-5" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{d.co}</div>
                  <span className={`text-[10px] uppercase rounded-full px-2 py-0.5 ${d.status === "Open" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{d.status}</span>
                </div>
                <div className="text-xs text-muted-foreground">{d.role} · {d.pkg} · Batch {d.batch}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="size-3" /> Last date: {d.date}</div>
              </div>
              <Button size="sm" className="rounded-full bg-gradient-primary text-primary-foreground">Apply</Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Interview Stories</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {stories.map((s) => (
            <div key={s.name} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <img src={`https://i.pravatar.cc/80?img=${s.img}`} alt="" className="size-10 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="text-xs text-muted-foreground">Placed at {s.co}</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">"{s.text}"</p>
              <button className="mt-4 text-xs font-medium text-primary">Read full story →</button>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
