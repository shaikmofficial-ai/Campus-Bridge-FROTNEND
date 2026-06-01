import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, Flag, TrendingUp, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · CampusBridge" }] }),
  component: Admin,
});

function Admin() {
  const pending = [
    { name: "Rohit M.", role: "Alumni · CSE 2018", img: 18 },
    { name: "Lakshmi P.", role: "Student · ECE 2026", img: 25 },
    { name: "Vivek S.", role: "Mentor · Google", img: 33 },
  ];
  const reports = [
    { type: "Spam", target: "Forum post in 'Career'", time: "1h ago" },
    { type: "Inappropriate", target: "Private DM", time: "3h ago" },
    { type: "Misinformation", target: "Resource upload", time: "1d ago" },
  ];

  return (
    <AppShell title="Admin Dashboard" subtitle="Verification, moderation and platform analytics.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Users", value: "6,748", tone: "bg-info/15 text-info" },
          { icon: ShieldCheck, label: "Pending Verifications", value: "23", tone: "bg-warning/15 text-warning" },
          { icon: Flag, label: "Open Reports", value: "7", tone: "bg-destructive/15 text-destructive" },
          { icon: TrendingUp, label: "Active This Week", value: "2,140", tone: "bg-success/15 text-success" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-3xl font-bold mt-1">{s.value}</div>
              </div>
              <div className={`size-9 grid place-items-center rounded-xl ${s.tone}`}><s.icon className="size-4" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold mb-4">Pending Verifications</h2>
          <ul className="space-y-3">
            {pending.map((p) => (
              <li key={p.name} className="flex items-center gap-3 rounded-xl bg-surface p-3">
                <img src={`https://i.pravatar.cc/80?img=${p.img}`} alt="" className="size-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.role}</div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full"><XCircle className="size-3.5" /> Reject</Button>
                <Button size="sm" className="rounded-full bg-success text-white hover:opacity-95"><CheckCircle2 className="size-3.5" /> Approve</Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold mb-4">Moderation Queue</h2>
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.target} className="flex items-center gap-3 rounded-xl bg-surface p-3">
                <div className="size-10 grid place-items-center rounded-lg bg-destructive/15 text-destructive"><Flag className="size-4" /></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{r.type}</div>
                  <div className="text-xs text-muted-foreground">{r.target} · {r.time}</div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full">Review</Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
