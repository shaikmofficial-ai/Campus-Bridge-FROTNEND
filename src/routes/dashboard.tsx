import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, MessagesSquare, Trophy, Calendar, ArrowUpRight, Rocket } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · CampusBridge" }] }),
  component: Dashboard,
});

function StatCard({ icon: Icon, label, value, delta, tone }: { icon: any; label: string; value: string; delta: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold mt-1 tabular-nums">{value}</div>
        </div>
        <div className={`size-9 grid place-items-center rounded-xl ${tone}`}><Icon className="size-4" /></div>
      </div>
      <div className="mt-3 text-xs text-success flex items-center gap-1"><ArrowUpRight className="size-3" /> {delta}</div>
    </div>
  );
}

function Dashboard() {
  const mentors = [
    { name: "Arun Prakash", role: "Software Engineer", co: "Zoho", tags: ["Web Dev", "React"], img: 11 },
    { name: "Swathi R.", role: "Data Analyst", co: "Deloitte", tags: ["Data", "Python"], img: 32 },
    { name: "Vigneshwaran", role: "SDE Intern", co: "Microsoft", tags: ["DSA", "Java"], img: 13 },
    { name: "Nivetha S.", role: "Product Designer", co: "Flipkart", tags: ["UI/UX", "Figma"], img: 47 },
  ];
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Good Morning, Karthik 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Let's continue your learning journey today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Mentors Connected" value="12" delta="2 this month" tone="bg-info/15 text-info" />
        <StatCard icon={BookOpen} label="Resources Saved" value="24" delta="6 this month" tone="bg-warning/15 text-warning" />
        <StatCard icon={MessagesSquare} label="Forum Interactions" value="18" delta="3 this month" tone="bg-destructive/15 text-destructive" />
        <StatCard icon={Trophy} label="Community Points" value="320" delta="40 this month" tone="bg-accent text-primary" />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recommended for you</h2>
          <button className="text-sm text-primary font-medium">View all</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mentors.map((m) => (
            <div key={m.name} className="rounded-2xl border border-border bg-card p-5 text-center">
              <img src={`https://i.pravatar.cc/120?img=${m.img}`} alt={m.name} className="size-20 rounded-full object-cover mx-auto" />
              <div className="mt-3 font-semibold">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.role}</div>
              <div className="text-[11px] text-muted-foreground">{m.co}</div>
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                {m.tags.map((t) => (
                  <span key={t} className="text-[10px] uppercase tracking-wider rounded-full bg-accent text-primary px-2 py-0.5">{t}</span>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-4 rounded-full w-full">Connect</Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 flex items-center gap-5">
          <div className="size-14 grid place-items-center rounded-2xl bg-gradient-primary text-primary-foreground"><Rocket className="size-6" /></div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Placement Drive</div>
            <div className="font-semibold text-lg">Zoho — Eligible: 2025 Batch</div>
            <div className="text-xs text-muted-foreground">Last date: 15 May 2025</div>
          </div>
          <Button size="sm" className="rounded-full bg-gradient-primary text-primary-foreground">View Details</Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2"><Calendar className="size-4 text-primary" /> Upcoming Events</h3>
            <button className="text-xs text-primary font-medium">View All</button>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              { d: "24 MAY", t: "Mock Interview Session", s: "Seminar Hall 3" },
              { d: "31 MAY", t: "Webinar: Career in Data Science", s: "Online" },
              { d: "07 JUN", t: "Alumni Networking Meet", s: "Auditorium" },
            ].map((e) => (
              <li key={e.t} className="flex items-start gap-3">
                <div className="rounded-lg bg-accent text-primary text-[10px] font-bold uppercase px-2 py-1 leading-tight text-center w-14">{e.d}</div>
                <div>
                  <div className="font-medium">{e.t}</div>
                  <div className="text-xs text-muted-foreground">{e.s}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
