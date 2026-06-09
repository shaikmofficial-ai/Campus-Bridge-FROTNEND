import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
import { GraduationCap, Mail, Linkedin, Github, Globe, Award, Loader2, AlertCircle, Camera, Building2 } from "lucide-react";
import { mentorApi, profileApi } from "@/lib/api/campus";
import { updateCachedUser } from "@/lib/auth";
import { PriChart } from "@/components/pri-chart";
import { avatarUrl, titleCase } from "@/lib/ui";
import type { MentorResponse, ProfileResponse, ProfileUpdatePayload } from "@/lib/api/types";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · CampusBridge" }] }),
  component: Profile,
});

function Profile() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editingMentor, setEditingMentor] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: p, isLoading, isError, error } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.me,
  });

  const isMentor = p?.role === "MENTOR" || p?.role === "ALUMNI";

  // Mentor-only: load the mentor profile (alumni fields, placedCount).
  const mentorQ = useQuery({
    queryKey: ["mentor-profile", p?.id],
    queryFn: () => mentorApi.profile(p!.id),
    enabled: !!p && isMentor,
    retry: false,
  });
  const mentor = mentorQ.data;

  const uploadPicture = useMutation({
    mutationFn: (file: File) => profileApi.uploadPicture(file),
    onSuccess: (updated) => {
      toast.success("Profile picture updated");
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      // Sync the navbar avatar instantly (global auth cache + event).
      updateCachedUser({ picture: updated.profilePictureUrl ?? undefined });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
  });

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPicture.mutate(file);
    e.target.value = "";
  };

  return (
    <AppShell>
      {isLoading && (
        <div className="min-h-[50vh] grid place-items-center text-muted-foreground">
          <div className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> Loading profile…</div>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="size-4" /> {error instanceof Error ? error.message : "Failed to load profile."}
        </div>
      )}

      {p && (
        <>
          <div className="rounded-3xl overflow-hidden border border-border bg-card">
            <div className="h-40 bg-gradient-primary" />
            <div className="px-6 pb-6 -mt-12 flex flex-col md:flex-row md:items-end gap-5">
              <div className="relative size-28 shrink-0">
                <img src={avatarUrl(p.profilePictureUrl, p.id, 200)} alt={p.name} className="size-28 rounded-2xl border-4 border-card object-cover shadow-soft" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadPicture.isPending}
                  className="absolute -bottom-1 -right-1 size-9 grid place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft ring-2 ring-card hover:opacity-90 disabled:opacity-60"
                  aria-label="Change profile picture"
                  title="Change profile picture"
                >
                  {uploadPicture.isPending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={onPickFile} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{p.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {titleCase(p.role)}{p.department ? ` · ${p.department}` : ""}{p.batch ? ` · Batch ${p.batch}` : ""}
                </p>
                {/* Alumni current employment */}
                {isMentor && (mentor?.currentRole || mentor?.currentCompany) && (
                  <p className="mt-1 text-sm font-medium text-primary flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    {[mentor?.currentRole, mentor?.currentCompany].filter(Boolean).join(" at ")}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><GraduationCap className="size-3.5" /> Dr. M.G.R. University</span>
                  <span className="flex items-center gap-1"><Mail className="size-3.5" /> {p.email}</span>
                  {p.registerNumber && <span className="rounded-full bg-muted px-2 py-0.5">Reg. No: {p.registerNumber}</span>}
                  <span className="rounded-full bg-accent text-primary px-2 py-0.5 text-[10px] uppercase tracking-wider">{titleCase(p.accountStatus)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {isMentor && (
                  <Button variant="outline" onClick={() => setEditingMentor(true)} className="rounded-full">Edit Mentor Info</Button>
                )}
                <Button onClick={() => setEditing(true)} className="rounded-full bg-gradient-primary text-primary-foreground">Edit Profile</Button>
              </div>
            </div>
          </div>

          {/* Students Placed Under Guidance — mentor only */}
          {isMentor && <PlacementTracker mentorUserId={p.id} canManage />}

          {/* PRI growth chart — students only */}
          {p.role === "STUDENT" && (
            <div className="mt-6">
              <PriChart userId={p.id} />
            </div>
          )}

          <div className="mt-6 grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <Card title="About">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.bio || "No bio yet. Click \u201cEdit Profile\u201d to add one."}
                </p>
              </Card>
              <Card title="Skills">
                {p.skills && p.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {p.skills.map((s) => (
                      <span key={s} className="text-xs rounded-full bg-accent text-primary px-3 py-1.5 font-medium">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                )}
              </Card>
              <Card title="Achievements">
                {p.achievements && p.achievements.length > 0 ? (
                  <ul className="space-y-3">
                    {p.achievements.map((a) => (
                      <li key={a} className="flex items-center gap-3 text-sm">
                        <div className="size-8 grid place-items-center rounded-lg bg-accent text-primary"><Award className="size-4" /></div>
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No achievements added yet.</p>
                )}
              </Card>
            </div>
            <div className="space-y-5">
              <Card title="Connect">
                <div className="space-y-2 text-sm">
                  {p.linkedinUrl ? (
                    <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Linkedin className="size-4" /> LinkedIn</a>
                  ) : null}
                  {p.githubUrl ? (
                    <a href={p.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Github className="size-4" /> GitHub</a>
                  ) : null}
                  {p.portfolioUrl ? (
                    <a href={p.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Globe className="size-4" /> Portfolio</a>
                  ) : null}
                  {!p.linkedinUrl && !p.githubUrl && !p.portfolioUrl && (
                    <p className="text-muted-foreground">No links added yet.</p>
                  )}
                </div>
              </Card>
              <Card title="Stats">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    [String(p.communityPoints), "Points"],
                    isMentor ? [String(mentor?.placedCount ?? 0), "Placed"] : [String(p.skills?.length ?? 0), "Skills"],
                    [String(p.achievements?.length ?? 0), "Awards"],
                  ].map(([v, k]) => (
                    <div key={k} className="rounded-xl bg-surface p-3">
                      <div className="text-xl font-bold">{v}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <EditProfileDialog
            open={editing}
            onOpenChange={setEditing}
            profile={p}
            onSaved={() => queryClient.invalidateQueries({ queryKey: ["profile", "me"] })}
          />
          {isMentor && (
            <EditMentorDialog
              open={editingMentor}
              onOpenChange={setEditingMentor}
              mentor={mentor}
              onSaved={() => queryClient.invalidateQueries({ queryKey: ["mentor-profile", p.id] })}
            />
          )}
        </>
      )}
    </AppShell>
  );
}

function EditProfileDialog({
  open, onOpenChange, profile, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: ProfileResponse;
  onSaved: () => void;
}) {
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedin] = useState("");
  const [githubUrl, setGithub] = useState("");
  const [portfolioUrl, setPortfolio] = useState("");
  const [skills, setSkills] = useState("");
  const [achievements, setAchievements] = useState("");

  useEffect(() => {
    if (open) {
      setBio(profile.bio ?? "");
      setLinkedin(profile.linkedinUrl ?? "");
      setGithub(profile.githubUrl ?? "");
      setPortfolio(profile.portfolioUrl ?? "");
      setSkills((profile.skills ?? []).join(", "));
      setAchievements((profile.achievements ?? []).join("\n"));
    }
  }, [open, profile]);

  const mutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => profileApi.update(payload),
    onSuccess: () => {
      toast.success("Profile updated");
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const save = () => {
    mutation.mutate({
      bio: bio.trim(),
      linkedinUrl: linkedinUrl.trim(),
      githubUrl: githubUrl.trim(),
      portfolioUrl: portfolioUrl.trim(),
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      achievements: achievements.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your bio, links, skills and achievements.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell the community about yourself" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" value={linkedinUrl} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input id="github" value={githubUrl} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input id="portfolio" value={portfolioUrl} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://…" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Java, Spring Boot, React" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="achievements">Achievements (one per line)</Label>
            <Textarea id="achievements" value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={3} placeholder={"Winner - Smart India Hackathon\nTop 5% LeetCode"} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={mutation.isPending} className="bg-gradient-primary text-primary-foreground">
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Saving…</> : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlacementTracker({ mentorUserId, canManage }: { mentorUserId: number; canManage?: boolean }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const placementsQ = useQuery({
    queryKey: ["mentor-placements", mentorUserId],
    queryFn: () => mentorApi.placements(mentorUserId),
  });
  const placements = placementsQ.data ?? [];

  const remove = useMutation({
    mutationFn: (id: number) => mentorApi.removePlacement(id),
    onSuccess: () => {
      toast.success("Record removed");
      queryClient.invalidateQueries({ queryKey: ["mentor-placements", mentorUserId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not remove"),
  });

  return (
    <div className="mt-6 rounded-3xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="size-9 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><GraduationCap className="size-4" /></div>
          <div>
            <h3 className="font-semibold">Students Placed Under Guidance</h3>
            <p className="text-xs text-muted-foreground">{placements.length} placement{placements.length === 1 ? "" : "s"} tracked</p>
          </div>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setAdding(true)} className="rounded-full bg-gradient-primary text-primary-foreground">
            + Add Placement
          </Button>
        )}
      </div>

      {placementsQ.isLoading ? (
        <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="size-4 animate-spin" /> Loading…</div>
      ) : placements.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No placement records yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {placements.map((pl) => (
            <div key={pl.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <img src={avatarUrl(pl.studentProfilePictureUrl, pl.studentName)} alt="" className="size-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{pl.studentName}</div>
                  <div className="text-xs text-muted-foreground">{pl.batch ? `Batch ${pl.batch}` : ""}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] uppercase rounded-full bg-success/15 text-success px-2 py-0.5 font-semibold">Placed</span>
                <span className="text-xs font-medium">{pl.company}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {[pl.role, pl.packageAmount].filter(Boolean).join(" · ")}
              </div>
              {canManage && (
                <button onClick={() => remove.mutate(pl.id)} className="mt-2 text-[11px] text-destructive hover:underline">Remove</button>
              )}
            </div>
          ))}
        </div>
      )}

      {canManage && <AddPlacementDialog open={adding} onOpenChange={setAdding} mentorUserId={mentorUserId} />}
    </div>
  );
}

function AddPlacementDialog({ open, onOpenChange, mentorUserId }: { open: boolean; onOpenChange: (v: boolean) => void; mentorUserId: number }) {
  const queryClient = useQueryClient();
  const [f, setF] = useState({ studentId: "", batch: "", company: "", role: "", packageAmount: "" });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  // Only students with an ACCEPTED connection to this mentor can be placed.
  const studentsQ = useQuery({
    queryKey: ["connected-students"],
    queryFn: mentorApi.connectedStudents,
    enabled: open,
  });
  const students = studentsQ.data ?? [];
  const selected = students.find((s) => String(s.id) === f.studentId);

  const mutation = useMutation({
    mutationFn: () => mentorApi.addPlacement({
      studentId: selected!.id,
      studentName: selected!.name,
      batch: (f.batch.trim() || selected?.batch) || undefined,
      company: f.company.trim(),
      role: f.role.trim() || undefined,
      packageAmount: f.packageAmount.trim() || undefined,
    }),
    onSuccess: () => {
      toast.success("Placement added");
      queryClient.invalidateQueries({ queryKey: ["mentor-placements", mentorUserId] });
      queryClient.invalidateQueries({ queryKey: ["mentor-profile", mentorUserId] });
      setF({ studentId: "", batch: "", company: "", role: "", packageAmount: "" });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add placement"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Placement Record</DialogTitle>
          <DialogDescription>Record a placement for a student connected with you.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="placement-student">Student</Label>
            {studentsQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2"><Loader2 className="size-4 animate-spin" /> Loading your students…</div>
            ) : students.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-3">
                No connected students yet. Accept a student's connection request first, then you can record their placement.
              </p>
            ) : (
              <select
                id="placement-student"
                value={f.studentId}
                onChange={(e) => set("studentId", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a connected student…</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.registerNumber ? ` (${s.registerNumber})` : ""}{s.batch ? ` · ${s.batch}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Batch</Label><Input value={f.batch} onChange={(e) => set("batch", e.target.value)} placeholder={selected?.batch || "2025"} /></div>
            <div className="space-y-1.5"><Label>Company</Label><Input value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="Zoho" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Role</Label><Input value={f.role} onChange={(e) => set("role", e.target.value)} placeholder="SDE" /></div>
            <div className="space-y-1.5"><Label>Package</Label><Input value={f.packageAmount} onChange={(e) => set("packageAmount", e.target.value)} placeholder="8 LPA" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !selected || !f.company.trim()} className="bg-gradient-primary text-primary-foreground">
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Adding…</> : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditMentorDialog({
  open, onOpenChange, mentor, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mentor?: MentorResponse;
  onSaved: () => void;
}) {
  const [designation, setDesignation] = useState("");
  const [company, setCompany] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [skills, setSkills] = useState("");
  const [domains, setDomains] = useState("");

  useEffect(() => {
    if (open) {
      setDesignation(mentor?.designation ?? "");
      setCompany(mentor?.company ?? "");
      setCurrentRole(mentor?.currentRole ?? "");
      setCurrentCompany(mentor?.currentCompany ?? "");
      setSkills((mentor?.skills ?? []).join(", "));
      setDomains((mentor?.domains ?? []).join(", "));
    }
  }, [open, mentor]);

  const mutation = useMutation({
    mutationFn: () => mentorApi.updateMyProfile({
      designation: designation.trim(),
      company: company.trim(),
      currentRole: currentRole.trim(),
      currentCompany: currentCompany.trim(),
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      domains: domains.split(",").map((s) => s.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      toast.success("Mentor profile updated");
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Mentor Info</DialogTitle>
          <DialogDescription>Showcase your experience and current role (for alumni).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Designation</Label><Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Senior Engineer" /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Zoho" /></div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alumni — Current Employment</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Current Role</Label><Input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="Software Engineer" /></div>
              <div className="space-y-2"><Label>Current Company</Label><Input value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} placeholder="Google" /></div>
            </div>
            <p className="text-[11px] text-muted-foreground">Shown as "Software Engineer at Google" on your cards and profile.</p>
          </div>
          <div className="space-y-2"><Label>Skills (comma separated)</Label><Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Java, React, DSA" /></div>
          <div className="space-y-2"><Label>Domains (comma separated)</Label><Input value={domains} onChange={(e) => setDomains(e.target.value)} placeholder="Web, Backend" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="bg-gradient-primary text-primary-foreground">
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Saving…</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
