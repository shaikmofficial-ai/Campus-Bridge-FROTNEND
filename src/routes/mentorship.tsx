import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Star, Search, Trophy, Award, Crown, Medal, Sparkles, TrendingUp,
  Users, GraduationCap, Briefcase, MessageCircle, BookOpen, Heart,
  Target, ChevronRight, Quote, Building2,
} from "lucide-react";

export const Route = createFileRoute("/mentorship")({
  head: () => ({ meta: [{ title: "Mentorship Hub · CampusBridge" }] }),
  component: Mentorship,
});

type Tier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Hall of Fame";

const tierStyle: Record<Tier, { bg: string; ring: string; text: string; icon: typeof Trophy }> = {
  Bronze:        { bg: "from-amber-700/20 to-amber-500/10",  ring: "ring-amber-600/40",  text: "text-amber-700",  icon: Medal },
  Silver:        { bg: "from-slate-400/25 to-slate-300/10",  ring: "ring-slate-400/50",  text: "text-slate-500",  icon: Award },
  Gold:          { bg: "from-yellow-400/30 to-amber-300/10", ring: "ring-yellow-500/50", text: "text-yellow-600", icon: Trophy },
  Platinum:      { bg: "from-cyan-300/25 to-indigo-300/10",  ring: "ring-cyan-400/50",   text: "text-cyan-600",   icon: Sparkles },
  "Hall of Fame":{ bg: "from-fuchsia-500/25 to-violet-500/10",ring: "ring-fuchsia-500/60",text: "text-fuchsia-600",icon: Crown },
};

type Mentor = {
  id: number; name: string; role: string; co: string; img: number; tier: Tier;
  impact: number; mentored: number; placed: number; rating: number; sessions: number;
  resources: number; contributions: number; tags: string[]; domains: string[];
};

const mentors: Mentor[] = [
  { id: 1, name: "Arun Prakash",  role: "Senior SWE",     co: "Zoho",      img: 11, tier: "Hall of Fame", impact: 982, mentored: 64, placed: 51, rating: 4.9, sessions: 312, resources: 48, contributions: 126, tags: ["React","Node","DSA"], domains: ["Web","Backend"] },
  { id: 2, name: "Swathi R.",     role: "Data Analyst",   co: "Deloitte",  img: 32, tier: "Platinum",     impact: 864, mentored: 52, placed: 41, rating: 4.8, sessions: 248, resources: 36, contributions: 88,  tags: ["SQL","Python","PowerBI"], domains: ["Data","Analytics"] },
  { id: 3, name: "Vigneshwaran",  role: "SDE II",         co: "Microsoft", img: 13, tier: "Platinum",     impact: 821, mentored: 47, placed: 38, rating: 4.8, sessions: 221, resources: 42, contributions: 71,  tags: ["DSA","Java","System Design"], domains: ["Backend","Cloud"] },
  { id: 4, name: "Nivetha S.",    role: "Product Designer", co: "Flipkart",img: 47, tier: "Gold",         impact: 712, mentored: 38, placed: 28, rating: 4.7, sessions: 184, resources: 29, contributions: 64,  tags: ["UI/UX","Figma"], domains: ["Design","Product"] },
  { id: 5, name: "Rahul K.",      role: "PM",             co: "Razorpay",  img: 15, tier: "Gold",         impact: 678, mentored: 34, placed: 25, rating: 4.7, sessions: 162, resources: 22, contributions: 58,  tags: ["Strategy","PRD"], domains: ["Product","Fintech"] },
  { id: 6, name: "Priya M.",      role: "ML Engineer",    co: "Google",    img: 25, tier: "Gold",         impact: 654, mentored: 31, placed: 24, rating: 4.8, sessions: 158, resources: 33, contributions: 52,  tags: ["ML","PyTorch"], domains: ["AI/ML","Research"] },
  { id: 7, name: "Aditya V.",     role: "DevOps Engineer",co: "AWS",       img: 18, tier: "Silver",       impact: 482, mentored: 22, placed: 16, rating: 4.6, sessions: 118, resources: 18, contributions: 34,  tags: ["AWS","Docker","K8s"], domains: ["Cloud","DevOps"] },
  { id: 8, name: "Meera S.",      role: "Researcher",     co: "Intel",     img: 35, tier: "Bronze",       impact: 312, mentored: 14, placed: 9,  rating: 4.5, sessions: 76,  resources: 11, contributions: 20,  tags: ["Research","C++"], domains: ["Research","Hardware"] },
];

const successStories = [
  { student: "Karthik R", img: 12, co: "Zoho",      role: "SDE",            mentor: "Arun Prakash",  quote: "Arun's mock interviews changed my approach to DSA — landed Zoho in 4 rounds." },
  { student: "Anitha M",  img: 49, co: "Microsoft", role: "SDE Intern",     mentor: "Vigneshwaran",  quote: "System design felt impossible until our weekly 1:1s. Forever grateful." },
  { student: "Dinesh P",  img: 33, co: "Deloitte",  role: "Data Analyst",   mentor: "Swathi R.",     quote: "Swathi turned my resume into a real story. The Deloitte panel loved it." },
];

const placementCompanies = [
  { name: "Zoho",      count: 38 }, { name: "Microsoft", count: 24 },
  { name: "Deloitte",  count: 21 }, { name: "Flipkart",  count: 17 },
  { name: "Razorpay",  count: 14 }, { name: "Google",    count: 11 },
  { name: "AWS",       count: 9  }, { name: "Intel",     count: 6  },
];

const topSkills  = ["DSA", "System Design", "React", "Python", "SQL", "Figma", "AWS", "ML", "PyTorch", "Java"];
const topDomains = ["Web Dev", "Data Science", "Product", "AI/ML", "Cloud", "Design", "Fintech", "Research"];

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
  const leaderboard = [...mentors].sort((a, b) => b.impact - a.impact).slice(0, 5);
  const totals = mentors.reduce((a, m) => ({
    mentors: a.mentors + 1,
    mentored: a.mentored + m.mentored,
    placed: a.placed + m.placed,
    sessions: a.sessions + m.sessions,
  }), { mentors: 0, mentored: 0, placed: 0, sessions: 0 });

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
              Where alumni shape <span className="text-gradient-primary">careers</span>.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Every session, story, and placement contributes to a measurable community impact score.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={Users}        label="Active Mentors"   value={totals.mentors} accent="from-primary/20 to-primary/0" />
            <Stat icon={GraduationCap}label="Students Mentored"value={totals.mentored} />
            <Stat icon={Briefcase}    label="Placements Driven"value={totals.placed} />
            <Stat icon={MessageCircle}label="1:1 Sessions"     value={totals.sessions} />
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-2 mb-4">
        <Search className="size-4 text-muted-foreground ml-2" />
        <input placeholder="Search by name, company, skill or tier…" className="flex-1 bg-transparent outline-none text-sm py-1.5" />
        <Button className="rounded-full bg-gradient-primary text-primary-foreground">Find Mentor</Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {(["All", "Hall of Fame", "Platinum", "Gold", "Silver", "Bronze"] as const).map((t, i) => (
          <button key={t} className={`text-xs rounded-full px-3 py-1.5 font-medium border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {/* Leaderboard + Top 3 */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5 mb-10">
        <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="size-9 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Trophy className="size-4" /></div>
              <div>
                <h3 className="font-semibold">Top Mentors Leaderboard</h3>
                <p className="text-xs text-muted-foreground">Ranked by impact score · placements · ratings</p>
              </div>
            </div>
            <button className="text-xs font-medium text-primary flex items-center gap-1">View all <ChevronRight className="size-3" /></button>
          </div>
          <div className="divide-y divide-border">
            {leaderboard.map((m, i) => (
              <div key={m.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className={`size-8 grid place-items-center rounded-lg font-bold text-sm ${i === 0 ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{i + 1}</div>
                <img src={`https://i.pravatar.cc/64?img=${m.img}`} alt="" className="size-11 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold text-sm truncate">{m.name}</div>
                    <TierBadge tier={m.tier} />
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{m.role} · {m.co}</div>
                </div>
                <div className="hidden sm:flex gap-5 text-center text-xs">
                  <div><div className="font-bold text-foreground">{m.placed}</div><div className="text-muted-foreground">placed</div></div>
                  <div><div className="font-bold text-foreground flex items-center gap-1 justify-center"><Star className="size-3 fill-warning text-warning" />{m.rating}</div><div className="text-muted-foreground">rating</div></div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gradient-primary">{m.impact}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">impact</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured tiers + recognition tiers */}
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
              const req = {
                "Bronze": "5+ students mentored",
                "Silver": "20+ mentored · 4.5★",
                "Gold": "30+ placed · 4.7★",
                "Platinum": "40+ placed · 4.8★",
                "Hall of Fame": "50+ placements · legacy",
              }[tier];
              return (
                <div key={tier} className={`flex items-center gap-3 rounded-2xl p-3 bg-gradient-to-r ${t.bg} ring-1 ${t.ring}`}>
                  <div className={`size-10 grid place-items-center rounded-xl bg-card/70 ${t.text}`}><Icon className="size-5" /></div>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${t.text}`}>{tier}</div>
                    <div className="text-[11px] text-muted-foreground">{req}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mentor cards with full impact data */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Meet Your Mentors</h2>
            <p className="text-xs text-muted-foreground">Each card reflects verified mentorship outcomes.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mentors.map((m) => {
            const rate = Math.round((m.placed / m.mentored) * 100);
            const t = tierStyle[m.tier];
            return (
              <div key={m.id} className="group relative rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition-all">
                <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${t.bg}`} />
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img src={`https://i.pravatar.cc/120?img=${m.img}`} alt="" className="size-14 rounded-full object-cover ring-2 ring-card" />
                    <div className={`absolute -bottom-1 -right-1 size-6 grid place-items-center rounded-full bg-card ring-2 ring-card ${t.text}`}>
                      <t.icon className="size-3.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold leading-tight truncate">{m.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.role} · {m.co}</div>
                    <div className="mt-1.5"><TierBadge tier={m.tier} /></div>
                  </div>
                </div>

                {/* Impact score */}
                <div className="mt-4 rounded-xl bg-gradient-to-br from-accent/60 to-transparent p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Impact Score</div>
                    <div className="text-2xl font-bold text-gradient-primary leading-none mt-0.5">{m.impact}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-success"><TrendingUp className="size-3.5" /> Top {Math.max(1, 100 - Math.round(m.impact / 12))}%</div>
                </div>

                {/* Stat grid */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <MiniStat value={m.mentored} label="Mentored" />
                  <MiniStat value={m.placed}   label="Placed" />
                  <MiniStat value={`${rate}%`} label="Success" />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <MiniStat value={<span className="flex items-center justify-center gap-0.5"><Star className="size-3 fill-warning text-warning" />{m.rating}</span>} label="Rating" />
                  <MiniStat value={m.sessions}   label="Sessions" />
                  <MiniStat value={m.resources}  label="Resources" />
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {m.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] uppercase rounded-full bg-accent text-primary px-2 py-0.5 font-medium">{tag}</span>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full flex-1">View Impact</Button>
                  <Button size="sm" className="rounded-full flex-1 bg-gradient-primary text-primary-foreground">Connect</Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mentorship Impact Section */}
      <section className="grid lg:grid-cols-3 gap-5 mb-10">
        {/* Success Stories */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-9 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Heart className="size-4" /></div>
            <div>
              <h3 className="font-semibold">Mentorship Impact · Success Stories</h3>
              <p className="text-xs text-muted-foreground">Students placed with consent to share their journey</p>
            </div>
          </div>
          <div className="space-y-4">
            {successStories.map((s) => (
              <div key={s.student} className="rounded-2xl border border-border bg-surface p-4 flex gap-4">
                <img src={`https://i.pravatar.cc/80?img=${s.img}`} alt="" className="size-12 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-sm">{s.student}</div>
                    <span className="text-[10px] uppercase rounded-full bg-success/15 text-success px-2 py-0.5 font-semibold">Placed · {s.co}</span>
                    <span className="text-xs text-muted-foreground">as {s.role}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Mentored by <span className="text-primary font-medium">{s.mentor}</span></div>
                  <p className="mt-2 text-sm text-foreground/90 leading-relaxed flex gap-2">
                    <Quote className="size-3.5 text-primary shrink-0 mt-1" />
                    <span>{s.quote}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Companies */}
        <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-9 grid place-items-center rounded-xl bg-accent text-primary"><Building2 className="size-4" /></div>
            <div>
              <h3 className="font-semibold">Placement Outcomes</h3>
              <p className="text-xs text-muted-foreground">Where mentees landed</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {placementCompanies.map((c) => {
              const max = placementCompanies[0].count;
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">{c.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${(c.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Skills & Domains */}
      <section className="grid md:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-9 grid place-items-center rounded-xl bg-accent text-primary"><BookOpen className="size-4" /></div>
            <div>
              <h3 className="font-semibold">Top Skills Mentored</h3>
              <p className="text-xs text-muted-foreground">Most-coached competencies this year</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((s, i) => (
              <span key={s} className={`text-xs rounded-full px-3 py-1.5 font-medium ${i < 3 ? "bg-gradient-primary text-primary-foreground" : "bg-accent text-primary"}`}>{s}</span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-9 grid place-items-center rounded-xl bg-accent text-primary"><Target className="size-4" /></div>
            <div>
              <h3 className="font-semibold">Career Domains Mentored</h3>
              <p className="text-xs text-muted-foreground">Where mentors are guiding juniors</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {topDomains.map((d, i) => (
              <span key={d} className={`text-xs rounded-full px-3 py-1.5 font-medium ${i < 3 ? "bg-gradient-primary text-primary-foreground" : "bg-accent text-primary"}`}>{d}</span>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, accent = "from-accent to-transparent" }: { icon: typeof Users; label: string; value: number; accent?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br ${accent} p-3.5`}>
      <Icon className="size-4 text-primary" />
      <div className="text-2xl font-bold mt-1 leading-none">{value.toLocaleString()}</div>
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
