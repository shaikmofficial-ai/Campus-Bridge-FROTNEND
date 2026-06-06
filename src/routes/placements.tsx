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
import { Calendar, Building2, Plus, Loader2, AlertCircle } from "lucide-react";
import { placementApi } from "@/lib/api/campus";
import { getUser } from "@/lib/auth";
import { avatarUrl, formatDate } from "@/lib/ui";
import type { PlacementDrive, PlacementStory } from "@/lib/api/types";

export const Route = createFileRoute("/placements")({
  head: () => ({ meta: [{ title: "Placement Hub · CampusBridge" }] }),
  component: Placements,
});

function Placements() {
  const isAdmin = getUser()?.role === "admin";
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
