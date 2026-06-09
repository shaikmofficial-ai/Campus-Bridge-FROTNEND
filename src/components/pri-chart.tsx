import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";
import { analyticsApi } from "@/lib/api/campus";

/**
 * Placement Readiness Index growth curve. Feeds the snapshot log (oldest ->
 * newest) into a responsive AreaChart: date on X, score on Y.
 */
export function PriChart({ userId }: { userId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["pri-snapshots", userId],
    queryFn: () => analyticsApi.snapshots(userId),
  });

  const points = (data ?? []).map((s) => ({
    date: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: s.score,
  }));
  const latest = points.length ? points[points.length - 1].score : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="size-9 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><TrendingUp className="size-4" /></div>
          <div>
            <h3 className="font-semibold">Placement Readiness Index</h3>
            <p className="text-xs text-muted-foreground">Your technical growth over time</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gradient-primary leading-none">{latest}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">current PRI</div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-56 grid place-items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Loading growth…</div>
        </div>
      ) : points.length === 0 ? (
        <div className="h-56 grid place-items-center text-sm text-muted-foreground text-center px-6">
          No history yet. Add skills, post in the forum, or get verified to start tracking your PRI.
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="priFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#priFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
