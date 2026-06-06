import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { GraduationCap, Mail, Linkedin, Github, Globe, Award, Loader2, AlertCircle } from "lucide-react";
import { profileApi } from "@/lib/api/campus";
import { avatarUrl, titleCase } from "@/lib/ui";
import type { ProfileResponse, ProfileUpdatePayload } from "@/lib/api/types";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · CampusBridge" }] }),
  component: Profile,
});

function Profile() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const { data: p, isLoading, isError, error } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.me,
  });

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
              <img src={avatarUrl(p.profilePictureUrl, p.id, 200)} alt={p.name} className="size-28 rounded-2xl border-4 border-card object-cover shadow-soft" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{p.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {titleCase(p.role)}{p.department ? ` · ${p.department}` : ""}{p.batch ? ` · Batch ${p.batch}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><GraduationCap className="size-3.5" /> Dr. M.G.R. University</span>
                  <span className="flex items-center gap-1"><Mail className="size-3.5" /> {p.email}</span>
                  <span className="rounded-full bg-accent text-primary px-2 py-0.5 text-[10px] uppercase tracking-wider">{titleCase(p.accountStatus)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setEditing(true)} className="rounded-full bg-gradient-primary text-primary-foreground">Edit Profile</Button>
              </div>
            </div>
          </div>

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
                    [String(p.skills?.length ?? 0), "Skills"],
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-sm font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}
