import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Crown, Trophy, Award, Loader2, AlertCircle } from "lucide-react";
import { leaderboardApi } from "@/lib/api/campus";
import { avatarUrl } from "@/lib/ui";
import type { LeaderboardEntry } from "@/lib/api/types";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Campus Toppers · CampusBridge" }] }),
  component: Leaderboard,
});

const podium = [
  { theme: "from-yellow-400/30 to-amber-300/10 ring-yellow-500/50 text-yellow-600", Icon: Crown, label: "Champion" },
  { theme: "from-slate-300/30 to-slate-200/10 ring-slate-400/50 text-slate-500", Icon: Trophy, label: "Runner-up" },
  { theme: "from-amber-700/25 to-amber-500/10 ring-amber-600/40 text-amber-700", Icon: Award, label: "Third Place" },
];

function Leaderboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: leaderboardApi.global,
  });

  const entries = data ?? [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <AppShell title="Campus Toppers" subtitle="The students leading the pack — earn points to climb the ranks.">
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorBox msg={error instanceof Error ? error.message : "Failed to load leaderboard."} />
      ) : entries.length === 0 ? (
        <Empty text="No ranked students yet. Solve lessons to get on the board!" />
      ) : (
        <>
          {/* Podium */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {top3.map((e, i) => {
              const p = podium[i];
              return (
                <Link
                  key={e.userId}
                  to="/profile/$userId"
                  params={{ userId: String(e.userId) }}
                  className={`relative rounded-3xl border bg-gradient-to-br ${p.theme} ring-1 p-6 text-center hover:shadow-elegant transition-all ${i === 0 ? "sm:-translate-y-3" : ""}`}
                >
                  <div className={`mx-auto size-10 grid place-items-center rounded-full bg-card/70 ${p.theme.split(" ").pop()}`}>
                    <p.Icon className="size-5" />
                  </div>
                  <img src={avatarUrl(e.profilePictureUrl, e.userId, 160)} alt="" className="size-20 rounded-full object-cover mx-auto mt-3 ring-4 ring-card" />
                  <div className="mt-3 font-bold">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{[e.department, e.batch].filter(Boolean).join(" · ") || "Student"}</div>
                  <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                    <div><div className="font-bold text-base">{e.totalPoints}</div><div className="text-muted-foreground">points</div></div>
                    <div><div className="font-bold text-base">{e.lessonsSolved}</div><div className="text-muted-foreground">solved</div></div>
                  </div>
                  <div className="absolute top-3 left-4 text-2xl font-black opacity-30">#{e.rank}</div>
                </Link>
              );
            })}
          </div>

          {/* Rankings grid */}
          {rest.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold mb-4">All Rankings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="py-2 pr-3">Rank</th>
                      <th className="py-2 pr-3">Student</th>
                      <th className="py-2 pr-3">Dept / Batch</th>
                      <th className="py-2 pr-3 text-right">Solved</th>
                      <th className="py-2 pr-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((e: LeaderboardEntry) => (
                      <tr key={e.userId} className="border-b border-border/60 hover:bg-muted/40">
                        <td className="py-2.5 pr-3 font-bold text-muted-foreground">#{e.rank}</td>
                        <td className="py-2.5 pr-3">
                          <Link
                            to="/profile/$userId"
                            params={{ userId: String(e.userId) }}
                            className="flex items-center gap-2 font-medium hover:text-primary"
                          >
                            <img src={avatarUrl(e.profilePictureUrl, e.userId)} alt="" className="size-8 rounded-full object-cover" />
                            {e.name}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground">{[e.department, e.batch].filter(Boolean).join(" · ") || "—"}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">{e.lessonsSolved}</td>
                        <td className="py-2.5 pr-3 text-right font-bold tabular-nums">{e.totalPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
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
