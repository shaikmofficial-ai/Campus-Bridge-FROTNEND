import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/campus-hero.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Users, GraduationCap, BookOpen, Building2, ShieldCheck,
  MessageSquare, Briefcase, Sparkles, Globe, Lock, Star, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusBridge — Connect. Learn. Grow Together." },
      { name: "description", content: "Connect with alumni, discover opportunities, and grow through a trusted university network." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Stats />
      <Features />
      <ForumSection />
      <CtaBanner />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 0%, oklch(0.92 0.08 264 / 0.5), transparent 60%), radial-gradient(50% 40% at 0% 100%, oklch(0.95 0.05 230 / 0.4), transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-12 lg:pt-20 pb-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" /> CampusBridge · Exclusively for MGR
          </span>
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Connect.<br /> Learn.<br />
            <span className="text-gradient-primary">Grow Together.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Connect with alumni, discover opportunities, and grow through a trusted university network.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full h-12 px-6 bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95">
              <Link to="/register">Join CampusBridge <ArrowRight className="ml-1 size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6">
              <Link to="/mentorship">Explore More</Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[
                "https://i.pravatar.cc/64?img=11",
                "https://i.pravatar.cc/64?img=32",
                "https://i.pravatar.cc/64?img=47",
                "https://i.pravatar.cc/64?img=58",
              ].map((src, i) => (
                <img key={i} src={src} alt="" className="size-9 rounded-full border-2 border-background object-cover" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by <span className="font-semibold text-foreground">5,000+ students</span>,<br />
              seniors &amp; alumni
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-primary opacity-20 blur-3xl rounded-[3rem]" aria-hidden />
          <div className="relative overflow-hidden rounded-[2.25rem] shadow-elegant ring-1 ring-border bg-card">
            <img
              src={heroImg}
              alt="Dr. M.G.R. Educational and Research Institute campus"
              width={1280}
              height={960}
              className="w-full h-[420px] md:h-[520px] object-cover"
            />
            <div className="absolute top-4 left-4 rounded-full bg-background/85 backdrop-blur px-3 py-1.5 text-xs font-semibold">
              Dr. M.G.R. Campus · Chennai
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { icon: Users, label: "Students", value: "5,000+" },
    { icon: GraduationCap, label: "Alumni", value: "1,200+" },
    { icon: Star, label: "Mentors", value: "350+" },
    { icon: BookOpen, label: "Resources", value: "800+" },
    { icon: Building2, label: "Departments", value: "30+" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 -mt-6">
      <div className="rounded-3xl border border-border bg-card shadow-soft p-5 md:p-7 grid grid-cols-2 md:grid-cols-5 gap-4">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-2">
            <div className="size-11 grid place-items-center rounded-xl bg-accent text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">{value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: GraduationCap, title: "Mentorship Hub", desc: "Get paired with alumni mentors across industries and specializations.", to: "/mentorship" },
    { icon: Briefcase, title: "Placement Experiences", desc: "Real interview stories, prep guides and company-specific insights.", to: "/placements" },
    { icon: BookOpen, title: "Resource Library", desc: "Curated study material, notes and reference repositories.", to: "/resources" },
    { icon: MessageSquare, title: "Real-time Chat", desc: "Secure messaging with mentors, peers and group conversations.", to: "/chat" },
    { icon: Globe, title: "Public Forum", desc: "Open discussions for all verified students, seniors and alumni.", to: "/forum" },
    { icon: ShieldCheck, title: "Admin Controls", desc: "Granular verification, moderation and analytics for institutions.", to: "/admin" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-24">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Everything in one place</span>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
          Built for every step of your campus journey
        </h2>
        <p className="mt-4 text-muted-foreground">
          From your first semester to your first job offer — and far beyond.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <Link
            key={f.title}
            to={f.to}
            className="group rounded-2xl border border-border bg-card p-6 hover:shadow-elegant hover:-translate-y-0.5 transition-all"
          >
            <div className="size-12 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Explore <ArrowRight className="size-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ForumSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-8 grid lg:grid-cols-2 gap-6">
      <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-info" />
            <h3 className="text-xl font-semibold">Public Forum</h3>
          </div>
          <span className="text-xs text-muted-foreground">Open to everyone</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Discussions for all verified students, seniors and alumni.
        </p>
        <ul className="mt-5 divide-y divide-border">
          {[
            { t: "How to prepare for coding interviews?", a: "Arun Prakash", c: 24, v: 120 },
            { t: "Best resources for DBMS?", a: "Swathi R.", c: 18, v: 89 },
            { t: "Share your internship experience!", a: "Vigneshwaran", c: 32, v: 150 },
            { t: "DAA important topics for end sem", a: "Nivetha S.", c: 12, v: 60 },
          ].map((p) => (
            <li key={p.t} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{p.t}</div>
                <div className="text-xs text-muted-foreground">{p.a}</div>
              </div>
              <div className="text-xs text-muted-foreground tabular-nums">{p.c} replies · {p.v} views</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="size-5 text-primary" />
            <h3 className="text-xl font-semibold">Private Forum</h3>
          </div>
          <span className="text-xs text-muted-foreground">Invite-only</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Exclusive communities for departments, batches and mentor groups.
        </p>
        <ul className="mt-5 grid gap-3">
          {[
            { name: "CSE 2022 Batch", members: 120 },
            { name: "Placement Preparation — 2025", members: 85 },
            { name: "Alumni — CSE", members: 60 },
            { name: "Web Developers Community", members: 95 },
          ].map((g) => (
            <li key={g.name} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <div>
                <div className="text-sm font-semibold">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.members} members</div>
              </div>
              <Button size="sm" variant="outline" className="rounded-full h-8">Join</Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 mt-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-primary text-primary-foreground p-10 md:p-14 shadow-elegant">
        <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="absolute -left-24 -bottom-24 size-80 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to bridge your campus journey?
          </h3>
          <p className="mt-3 text-primary-foreground/85">
            Join thousands of MGR students, seniors and alumni building a stronger network — together.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full h-12 px-6 bg-background text-foreground hover:bg-background/90">
              <Link to="/register">Create your account</Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/85">
              <CheckCircle2 className="size-4" /> Verified institute email required
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
