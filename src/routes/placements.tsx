import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Building2, Plus, Loader2, AlertCircle, Search, ExternalLink, MapPin, RefreshCw, Briefcase, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { mentorJobApi, placementApi } from "@/lib/api/campus";
import { getUser } from "@/lib/auth";
import { avatarUrl, formatDate, timeAgo } from "@/lib/ui";
import type { ExternalJob, MentorJob, PlacementDrive, PlacementStory } from "@/lib/api/types";

export const Route = createFileRoute("/placements")({
  head: () => ({ meta: [{ title: "Placement Hub · CampusBridge" }] }),
  component: Placements,
});

function Placements() {
  const isAdmin = getUser()?.role === "admin";
  const isMentor = getUser()?.role === "mentor" || getUser()?.role === "alumni";
  const [driveOpen, setDriveOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);

  const drivesQ = useQuery({ queryKey: ["placements", "drives"], queryFn: placementApi.drives });
  const storiesQ = useQuery({ queryKey: ["placements", "stories"], queryFn: placementApi.stories });

  const drives = drivesQ.data ?? [];
  const stories = storiesQ.data ?? [];

  return (
    <AppShell title="Placement Experience Hub" subtitle="Drives, prep guides and stories from those who've been there.">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Active Drives</h2>
          {isAdmin && (
            <Button onClick={() => setDriveOpen(true)} size="sm" className="rounded-full bg-gradient-primary text-primary-foreground">
              <Plus className="size-4" /> New Drive
            </Button>
          )}
        </div>
        {drivesQ.isLoading ? (
          <Loading />
        ) : drivesQ.isError ? (
          <ErrorBox msg={drivesQ.error instanceof Error ? drivesQ.error.message : "Failed to load drives."} />
        ) : drives.length === 0 ? (
          <Empty text="No placement drives posted yet." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {drives.map((d: PlacementDrive) => (
              <div key={d.id} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
                <div className="size-12 grid place-items-center rounded-xl bg-accent text-primary"><Building2 className="size-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{d.companyName}</div>
                    <span className={`text-[10px] uppercase rounded-full px-2 py-0.5 ${d.status === "OPEN" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{d.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {[d.role, d.packageAmount, d.location].filter(Boolean).join(" · ")}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="size-3" /> Last date: {formatDate(d.applicationDeadline) || "TBA"}
                  </div>
                </div>
                {d.applicationLink ? (
                  <Button asChild size="sm" className="rounded-full bg-gradient-primary text-primary-foreground">
                    <a href={d.applicationLink} target="_blank" rel="noreferrer">Apply</a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="rounded-full" disabled>Apply</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <LiveJobs isAdmin={isAdmin} />

      <MentorJobBoard isMentor={isMentor || isAdmin} />

      <section className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Interview Stories</h2>
          <Button onClick={() => setStoryOpen(true)} size="sm" variant="outline" className="rounded-full">
            <Plus className="size-4" /> Share Story
          </Button>
        </div>
        {storiesQ.isLoading ? (
          <Loading />
        ) : stories.length === 0 ? (
          <Empty text="No stories shared yet. Be the first!" />
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {stories.map((s: PlacementStory) => (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <img src={avatarUrl(s.imageUrl, s.studentName ?? s.id)} alt="" className="size-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm">{s.studentName ?? "Student"}</div>
                    <div className="text-xs text-muted-foreground">Placed at {s.companyName}{s.role ? ` · ${s.role}` : ""}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-5">"{s.story}"</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <NewDriveDialog open={driveOpen} onOpenChange={setDriveOpen} />
      <NewStoryDialog open={storyOpen} onOpenChange={setStoryOpen} />
    </AppShell>
  );
}

function NewDriveDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [f, setF] = useState({
    companyName: "", role: "", packageAmount: "", location: "",
    eligibilityCriteria: "", applicationDeadline: "", applicationLink: "", description: "",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: () =>
      placementApi.createDrive({
        companyName: f.companyName.trim(),
        role: f.role.trim(),
        packageAmount: f.packageAmount.trim() || undefined,
        location: f.location.trim() || undefined,
        eligibilityCriteria: f.eligibilityCriteria.trim() || undefined,
        applicationDeadline: f.applicationDeadline || undefined,
        applicationLink: f.applicationLink.trim() || undefined,
        description: f.description.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Drive created");
      queryClient.invalidateQueries({ queryKey: ["placements", "drives"] });
      onOpenChange(false);
      setF({ companyName: "", role: "", packageAmount: "", location: "", eligibilityCriteria: "", applicationDeadline: "", applicationLink: "", description: "" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create drive"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Placement Drive</DialogTitle>
          <DialogDescription>Post a new opportunity for students.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <Field label="Company"><Input value={f.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Zoho Corporation" /></Field>
          <Field label="Role"><Input value={f.role} onChange={(e) => set("role", e.target.value)} placeholder="Software Engineer" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Package"><Input value={f.packageAmount} onChange={(e) => set("packageAmount", e.target.value)} placeholder="8 LPA" /></Field>
            <Field label="Location"><Input value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Chennai" /></Field>
          </div>
          <Field label="Eligibility"><Input value={f.eligibilityCriteria} onChange={(e) => set("eligibilityCriteria", e.target.value)} placeholder="B.Tech CSE, 2025, CGPA > 7" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deadline"><Input type="date" value={f.applicationDeadline} onChange={(e) => set("applicationDeadline", e.target.value)} /></Field>
            <Field label="Apply Link"><Input value={f.applicationLink} onChange={(e) => set("applicationLink", e.target.value)} placeholder="https://careers…" /></Field>
          </div>
          <Field label="Description"><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={3} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !f.companyName.trim() || !f.role.trim() || !f.applicationDeadline} className="bg-gradient-primary text-primary-foreground">
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Creating…</> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewStoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [f, setF] = useState({ companyName: "", role: "", packageAmount: "", story: "" });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: () =>
      placementApi.createStory({
        companyName: f.companyName.trim(),
        role: f.role.trim(),
        packageAmount: f.packageAmount.trim() || undefined,
        story: f.story.trim(),
      }),
    onSuccess: () => {
      toast.success("Story shared");
      queryClient.invalidateQueries({ queryKey: ["placements", "stories"] });
      onOpenChange(false);
      setF({ companyName: "", role: "", packageAmount: "", story: "" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not share story"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Your Interview Story</DialogTitle>
          <DialogDescription>Help juniors learn from your experience.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company"><Input value={f.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Zoho" /></Field>
            <Field label="Role"><Input value={f.role} onChange={(e) => set("role", e.target.value)} placeholder="Software Engineer" /></Field>
          </div>
          <Field label="Package (optional)"><Input value={f.packageAmount} onChange={(e) => set("packageAmount", e.target.value)} placeholder="8 LPA" /></Field>
          <Field label="Your Story"><Textarea value={f.story} onChange={(e) => set("story", e.target.value)} rows={5} placeholder="Describe the rounds, what to focus on…" /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !f.companyName.trim() || !f.role.trim() || !f.story.trim()} className="bg-gradient-primary text-primary-foreground">
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Sharing…</> : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LiveJobs({ isAdmin }: { isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [filters, setFilters] = useState<{ query?: string; location?: string }>({});
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const jobsQ = useQuery({
    queryKey: ["placements", "jobs", filters],
    queryFn: () => placementApi.jobs(filters),
  });

  const refresh = useMutation({
    mutationFn: () => placementApi.refreshJobs(),
    onSuccess: (d) => {
      toast.success(`Refreshed ${d.refreshed} jobs from the provider`);
      queryClient.invalidateQueries({ queryKey: ["placements", "jobs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Refresh failed"),
  });

  const jobs = jobsQ.data ?? [];
  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedJobs = jobs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 whenever a new search is run.
  const runSearch = () => {
    setFilters({ query: query.trim() || undefined, location: location.trim() || undefined });
    setPage(1);
  };

  const formatSalary = (min?: number, max?: number) => {
    const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    if (max) return `Up to ${fmt(max)}`;
    return null;
  };

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="size-5 text-primary" /> Live Job Openings
          </h2>
          <p className="text-xs text-muted-foreground">Auto-updated from Adzuna. Apply directly on the company site.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => refresh.mutate()} size="sm" variant="outline" className="rounded-full" disabled={refresh.isPending}>
            <RefreshCw className={`size-4 ${refresh.isPending ? "animate-spin" : ""}`} /> Refresh
          </Button>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); runSearch(); }}
        className="rounded-2xl border border-border bg-card p-3 flex flex-col sm:flex-row items-stretch gap-2 mb-4"
      >
        <div className="flex items-center gap-2 flex-1 rounded-full bg-muted px-3">
          <Search className="size-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Role or company (e.g. Java developer)" className="flex-1 bg-transparent text-sm outline-none py-2" />
        </div>
        <div className="flex items-center gap-2 flex-1 rounded-full bg-muted px-3">
          <MapPin className="size-4 text-muted-foreground" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (e.g. Chennai)" className="flex-1 bg-transparent text-sm outline-none py-2" />
        </div>
        <Button type="submit" className="rounded-full bg-gradient-primary text-primary-foreground">Search</Button>
      </form>

      {jobsQ.isLoading ? (
        <Loading />
      ) : jobsQ.isError ? (
        <ErrorBox msg={jobsQ.error instanceof Error ? jobsQ.error.message : "Failed to load jobs."} />
      ) : jobs.length === 0 ? (
        <Empty text="No live jobs yet. An admin can hit Refresh once the Adzuna API key is configured." />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedJobs.map((j: ExternalJob) => {
              const salary = formatSalary(j.salaryMin, j.salaryMax);
              return (
                <div key={j.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="size-10 grid place-items-center rounded-xl bg-accent text-primary shrink-0"><Building2 className="size-5" /></div>
                    {j.source && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{j.source}</span>}
                  </div>
                  <div className="mt-3 font-semibold leading-snug line-clamp-2">{j.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{j.company || "Company undisclosed"}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="size-3" /> {j.location || "Location flexible"}
                  </div>
                  {salary && <div className="text-xs font-medium text-success mt-1">{salary}</div>}
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{j.postedAt ? timeAgo(j.postedAt) : ""}</span>
                    {j.redirectUrl && (
                      <Button asChild size="sm" className="rounded-full bg-gradient-primary text-primary-foreground">
                        <a href={j.redirectUrl} target="_blank" rel="noreferrer">Apply <ExternalLink className="size-3.5" /></a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" /> Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`size-8 rounded-full text-sm font-medium ${n === safePage ? "bg-gradient-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}
                >
                  {n}
                </button>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, jobs.length)} of {jobs.length} jobs
          </p>
        </>
      )}
    </section>
  );
}

function MentorJobBoard({ isMentor }: { isMentor: boolean }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const jobsQ = useQuery({ queryKey: ["mentor-jobs"], queryFn: mentorJobApi.list });
  const jobs = jobsQ.data ?? [];

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" /> Mentor Job Board
          </h2>
          <p className="text-xs text-muted-foreground">Openings shared directly by alumni mentors.</p>
        </div>
        {isMentor && (
          <Button onClick={() => setOpen(true)} size="sm" className="rounded-full bg-gradient-primary text-primary-foreground">
            <Plus className="size-4" /> Post a Job
          </Button>
        )}
      </div>

      {jobsQ.isLoading ? (
        <Loading />
      ) : jobsQ.isError ? (
        <ErrorBox msg={jobsQ.error instanceof Error ? jobsQ.error.message : "Failed to load mentor jobs."} />
      ) : jobs.length === 0 ? (
        <Empty text={isMentor ? "No postings yet. Be the first mentor to share an opening!" : "No mentor postings yet. Check back soon."} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((j: MentorJob) => (
            <div key={j.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="size-10 grid place-items-center rounded-xl bg-accent text-primary shrink-0"><Briefcase className="size-5" /></div>
                {j.jobType && <span className="text-[10px] uppercase tracking-wider rounded-full bg-accent text-primary px-2 py-0.5">{j.jobType.replace("_", " ")}</span>}
              </div>
              <div className="mt-3 font-semibold leading-snug">{j.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{[j.company, j.location].filter(Boolean).join(" · ")}</div>
              {j.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{j.description}</p>}
              {j.skills && j.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {j.skills.slice(0, 4).map((s) => (
                    <span key={s} className="text-[10px] uppercase rounded-full bg-muted text-foreground px-2 py-0.5">{s}</span>
                  ))}
                </div>
              )}
              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">by {j.mentorName ?? "Mentor"}{j.createdAt ? ` · ${timeAgo(j.createdAt)}` : ""}</span>
                {j.applyLink && (
                  <Button asChild size="sm" className="rounded-full bg-gradient-primary text-primary-foreground">
                    <a href={j.applyLink} target="_blank" rel="noreferrer">Apply <ExternalLink className="size-3.5" /></a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <NewMentorJobDialog open={open} onOpenChange={setOpen} onCreated={() => queryClient.invalidateQueries({ queryKey: ["mentor-jobs"] })} />
    </section>
  );
}

function NewMentorJobDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const [f, setF] = useState({ title: "", company: "", location: "", jobType: "FULL_TIME", description: "", applyLink: "", skills: "" });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: () =>
      mentorJobApi.create({
        title: f.title.trim(),
        company: f.company.trim() || undefined,
        location: f.location.trim() || undefined,
        jobType: f.jobType,
        description: f.description.trim() || undefined,
        applyLink: f.applyLink.trim() || undefined,
        skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      toast.success("Job posted");
      onCreated();
      onOpenChange(false);
      setF({ title: "", company: "", location: "", jobType: "FULL_TIME", description: "", applyLink: "", skills: "" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not post job"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Post a Job Opening</DialogTitle>
          <DialogDescription>Share an opportunity with students from your network.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <Field label="Title"><Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Software Engineer Intern" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company"><Input value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="Zoho" /></Field>
            <Field label="Location"><Input value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Chennai / Remote" /></Field>
          </div>
          <Field label="Type">
            <select value={f.jobType} onChange={(e) => set("jobType", e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {["FULL_TIME", "INTERNSHIP", "PART_TIME", "CONTRACT"].map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Description"><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Role, responsibilities, eligibility…" /></Field>
          <Field label="Apply Link"><Input value={f.applyLink} onChange={(e) => set("applyLink", e.target.value)} placeholder="https://…" /></Field>
          <Field label="Skills (comma separated)"><Input value={f.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Java, Spring, React" /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !f.title.trim()} className="bg-gradient-primary text-primary-foreground">
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Posting…</> : "Post Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
function Loading() {
  return <div className="grid place-items-center py-10 text-muted-foreground"><div className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> Loading…</div></div>;
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</div>;
}
function ErrorBox({ msg }: { msg: string }) {
  return <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive flex items-center gap-2"><AlertCircle className="size-4" /> {msg}</div>;
}
