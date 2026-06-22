import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PriChart } from "@/components/pri-chart";
import { GraduationCap, Award, Linkedin, Github, Globe, Loader2, AlertCircle } from "lucide-react";
import { profileApi } from "@/lib/api/campus";
import { getUser } from "@/lib/auth";
import { avatarUrl, titleCase } from "@/lib/ui";

export const Route = createFileRoute("/profile/$userId")({
  head: () => ({ meta: [{ title: "Profile · CampusBridge" }] }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  // Read the explicit peer id straight from the URL path.
  const { userId } = useParams({ from: "/profile/$userId" });
  const targetId = Number(userId);
  const loggedInUser = getUser();

  // Per spec: owner only when there's no userId in the path, or it matches the
  // logged-in session id. Otherwise it's a read-only peer portfolio. Data is
  // ALWAYS hydrated from the URL id below — never the session user.
  const isOwner = !userId || loggedInUser?.id === Number(userId);

  const { data: p, isLoading, isError, error } = useQuery({
    // Keyed by the target id so each peer loads their own dataset (no caching
    // collisions with the logged-in user's profile query).
    queryKey: ["public-profile", targetId],
    queryFn: () => profileApi.publicById(targetId),
    enabled: Number.isFinite(targetId) && targetId > 0,
  });

  const isSelf = isOwner;

  return (
    <AppShell>
      {isLoading && (
        <div className="min-h-[50vh] grid place-items-center text-muted-foreground">
          <div className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> Loading profile…</div>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="size-4" /> {error instanceof Error ? error.message : "Profile not found."}
        </div>
      )}

      {p && (
        <>
          <div className="rounded-3xl overflow-hidden border border-border bg-card">
            <div className="h-40 bg-gradient-primary" />
            <div className="px-6 pb-6 -mt-12 flex flex-col md:flex-row md:items-end gap-5">
              {/* Read-only: no camera/upload overlay for other users' profiles */}
              <img src={avatarUrl(p.profilePictureUrl, p.id, 200)} alt={p.name} className="size-28 rounded-2xl border-4 border-card object-cover shadow-soft" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{p.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {titleCase(p.role)}{p.department ? ` · ${p.department}` : ""}{p.batch ? ` · Batch ${p.batch}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><GraduationCap className="size-3.5" /> Dr. M.G.R. University</span>
                </div>
              </div>
              {isSelf && (
                <a href="/profile" className="text-sm text-primary font-medium rounded-full border border-border px-4 py-2 hover:bg-muted">
                  Edit my profile
                </a>
              )}
            </div>
          </div>

          {p.role === "STUDENT" && (
            <div className="mt-6">
              <PriChart userId={p.id} />
            </div>
          )}

          <div className="mt-6 grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <Card title="About">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.bio || "This user hasn't added a bio yet."}
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
                  <p className="text-sm text-muted-foreground">No skills listed.</p>
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
                  <p className="text-sm text-muted-foreground">No achievements listed.</p>
                )}
              </Card>
            </div>
            <div className="space-y-5">
              <Card title="Connect">
                <div className="space-y-2 text-sm">
                  {p.linkedinUrl && <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Linkedin className="size-4" /> LinkedIn</a>}
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Github className="size-4" /> GitHub</a>}
                  {p.portfolioUrl && <a href={p.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Globe className="size-4" /> Portfolio</a>}
                  {!p.linkedinUrl && !p.githubUrl && !p.portfolioUrl && <p className="text-muted-foreground">No links shared.</p>}
                </div>
              </Card>
              <Card title="Community Points">
                <div className="text-3xl font-bold text-gradient-primary">{p.communityPoints}</div>
              </Card>
            </div>
          </div>
        </>
      )}
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
