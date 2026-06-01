import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { MapPin, GraduationCap, Mail, Linkedin, Github, Award } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · CampusBridge" }] }),
  component: Profile,
});

function Profile() {
  return (
    <AppShell>
      <div className="rounded-3xl overflow-hidden border border-border bg-card">
        <div className="h-40 bg-gradient-primary" />
        <div className="px-6 pb-6 -mt-12 flex flex-col md:flex-row md:items-end gap-5">
          <img src="https://i.pravatar.cc/200?img=12" alt="" className="size-28 rounded-2xl border-4 border-card object-cover shadow-soft" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Karthik R</h1>
            <p className="text-sm text-muted-foreground">B.Tech CSE · Final Year</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><GraduationCap className="size-3.5" /> Dr. M.G.R. University</span>
              <span className="flex items-center gap-1"><MapPin className="size-3.5" /> Chennai, India</span>
              <span className="flex items-center gap-1"><Mail className="size-3.5" /> karthik@mgru.edu.in</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full">Message</Button>
            <Button className="rounded-full bg-gradient-primary text-primary-foreground">Edit Profile</Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card title="About">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Final-year CSE student passionate about full-stack development and machine learning.
              Building CampusBridge to help my juniors find mentorship faster than I did.
            </p>
          </Card>
          <Card title="Skills">
            <div className="flex flex-wrap gap-2">
              {["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "TensorFlow", "Figma"].map((s) => (
                <span key={s} className="text-xs rounded-full bg-accent text-primary px-3 py-1.5 font-medium">{s}</span>
              ))}
            </div>
          </Card>
          <Card title="Achievements">
            <ul className="space-y-3">
              {["Winner — Smart India Hackathon 2024", "Top 5% — LeetCode Weekly Contest", "Published paper at IEEE Conf. 2024"].map((a) => (
                <li key={a} className="flex items-center gap-3 text-sm">
                  <div className="size-8 grid place-items-center rounded-lg bg-accent text-primary"><Award className="size-4" /></div>
                  {a}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="space-y-5">
          <Card title="Connect">
            <div className="space-y-2 text-sm">
              <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Linkedin className="size-4" /> linkedin.com/karthik-r</a>
              <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Github className="size-4" /> github.com/karthik-r</a>
            </div>
          </Card>
          <Card title="Stats">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[["12", "Mentors"], ["24", "Posts"], ["320", "Points"]].map(([v, k]) => (
                <div key={k} className="rounded-xl bg-surface p-3">
                  <div className="text-xl font-bold">{v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-sm font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}
