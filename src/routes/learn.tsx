import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ConfettiBurst } from "@/components/confetti-burst";
import {
  Lock, Check, Play, Loader2, AlertCircle, ArrowLeft, Target, Terminal, Sparkles, X,
} from "lucide-react";
import { learningApi } from "@/lib/api/campus";
import type { CodeRunResult, LearningNode } from "@/lib/api/types";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn Coding · CampusBridge" }] }),
  component: Learn,
});

function Learn() {
  const [active, setActive] = useState<LearningNode | null>(null);
  const roadmapQ = useQuery({ queryKey: ["learn", "roadmap"], queryFn: learningApi.roadmap });
  const nodes = roadmapQ.data ?? [];

  if (active) {
    return <Workspace node={active} onBack={() => setActive(null)} />;
  }

  const completedCount = nodes.filter((n) => n.state === "COMPLETED").length;

  return (
    <AppShell title="Learn Coding" subtitle="Follow the path, solve challenges, earn points.">
      {roadmapQ.isLoading ? (
        <Loading />
      ) : roadmapQ.isError ? (
        <ErrorBox msg={roadmapQ.error instanceof Error ? roadmapQ.error.message : "Failed to load roadmap."} />
      ) : nodes.length === 0 ? (
        <Empty text="No lessons available yet." />
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 mb-8 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Your Progress</div>
              <div className="text-xs text-muted-foreground">{completedCount} of {nodes.length} lessons solved</div>
            </div>
            <div className="flex-1 mx-6 max-w-md">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-primary transition-all"
                  style={{ width: `${(completedCount / nodes.length) * 100}%` }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gradient-primary">{completedCount * 25} pts</div>
          </div>

          {/* The trail of connected nodes */}
          <div className="relative">
            {nodes.map((n, i) => (
              <RoadmapNode key={n.id} node={n} index={i} isLast={i === nodes.length - 1} onOpen={() => setActive(n)} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

function RoadmapNode({ node, index, isLast, onOpen }: { node: LearningNode; index: number; isLast: boolean; onOpen: () => void }) {
  const [shake, setShake] = useState(false);
  const locked = node.state === "LOCKED";
  const completed = node.state === "COMPLETED";
  const activeNode = node.state === "ACTIVE";
  const alignLeft = index % 2 === 0;

  const handleClick = () => {
    if (locked) {
      setShake(true);
      toast.error("Complete the previous challenge to unlock this module!");
      setTimeout(() => setShake(false), 500);
      return;
    }
    onOpen();
  };

  return (
    <div className={`relative flex ${alignLeft ? "justify-start" : "justify-end"} mb-4`}>
      <style>{`
        @keyframes node-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes node-pulse { 0%,100%{box-shadow:0 0 0 0 hsl(var(--primary)/0.5)} 50%{box-shadow:0 0 0 8px hsl(var(--primary)/0)} }
      `}</style>
      {!isLast && <div className="absolute left-1/2 -translate-x-1/2 top-16 h-8 w-0.5 bg-border" />}
      <button
        onClick={handleClick}
        style={{
          animation: shake ? "node-shake 0.5s" : activeNode ? "node-pulse 1.8s infinite" : undefined,
        }}
        className={`w-full max-w-md text-left rounded-2xl border p-4 flex items-center gap-4 transition-all
          ${locked ? "border-border bg-muted/40 opacity-70 cursor-not-allowed"
            : completed ? "border-success/40 bg-success/10 hover:shadow-soft"
            : "border-primary bg-card hover:shadow-elegant"}`}
      >
        <div className={`size-12 grid place-items-center rounded-xl shrink-0 font-bold
          ${locked ? "bg-muted text-muted-foreground"
            : completed ? "bg-success text-white"
            : "bg-gradient-primary text-primary-foreground"}`}>
          {locked ? <Lock className="size-5" /> : completed ? <Check className="size-5" /> : node.orderIndex}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Lesson {node.orderIndex} · {node.language}</div>
          <div className="font-semibold truncate">{node.title}</div>
          <div className="text-xs text-muted-foreground">
            {locked ? "Locked" : completed ? "Completed · +25 pts" : "Ready to solve"}
          </div>
        </div>
        {activeNode && <span className="text-[10px] uppercase font-bold text-primary rounded-full bg-accent px-2 py-1">Start</span>}
      </button>
    </div>
  );
}

function Workspace({ node, onBack }: { node: LearningNode; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState(node.starterCode ?? "");
  const [result, setResult] = useState<CodeRunResult | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => { setCode(node.starterCode ?? ""); setResult(null); }, [node]);

  const run = useMutation({
    mutationFn: () => learningApi.submit({ moduleOrderId: node.orderIndex, code, languageId: node.languageId }),
    onSuccess: (res) => {
      setResult(res);
      if (res.passed) {
        if (res.pointsAwarded) {
          setCelebrate(true);
          queryClient.invalidateQueries({ queryKey: ["learn", "roadmap"] });
          queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
          queryClient.invalidateQueries({ queryKey: ["pri-snapshots"] });
        } else {
          toast.success("Correct! (already cleared)");
        }
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Run failed"),
  });

  return (
    <AppShell title={node.title} subtitle={`Lesson ${node.orderIndex} · ${node.language}`}>
      {celebrate && <ConfettiBurst onDone={() => setCelebrate(false)} />}
      {celebrate && (
        <div className="fixed inset-0 z-[101] grid place-items-center bg-black/30" onClick={() => setCelebrate(false)}>
          <div className="rounded-3xl bg-card border border-border shadow-elegant p-8 text-center max-w-sm mx-4 animate-in">
            <div className="size-16 mx-auto grid place-items-center rounded-2xl bg-gradient-primary text-primary-foreground mb-4">
              <Sparkles className="size-8" />
            </div>
            <h2 className="text-xl font-bold">Challenge Solved!</h2>
            <p className="text-sm text-muted-foreground mt-1">+25 Points Added to Your Rank!</p>
            <Button className="mt-5 rounded-full bg-gradient-primary text-primary-foreground" onClick={() => setCelebrate(false)}>
              Keep Going
            </Button>
          </div>
        </div>
      )}

      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Back to roadmap
      </button>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Left: content reader */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-3">{node.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{node.content}</p>
          <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Target className="size-4" /> Your Mission
            </div>
            <p className="text-sm text-foreground/90">{node.mission}</p>
          </div>
        </div>

        {/* Right: editor + console */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-[#1e1e2e] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <span className="text-xs text-white/60 font-mono">{node.language?.toLowerCase()} · editor</span>
              <span className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-400" />
                <span className="size-2.5 rounded-full bg-yellow-400" />
                <span className="size-2.5 rounded-full bg-green-400" />
              </span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={12}
              className="w-full bg-[#1e1e2e] text-[#d4d4d4] font-mono text-sm p-4 outline-none resize-y leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Run your code against the mission's expected output.</div>
            <Button
              onClick={() => run.mutate()}
              disabled={run.isPending}
              className="rounded-full bg-gradient-primary text-primary-foreground"
            >
              {run.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Running…</> : <><Play className="mr-1 size-4" /> Run Check</>}
            </Button>
          </div>

          {/* Console */}
          <div className="rounded-2xl border border-border bg-[#0f0f17] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 text-xs text-white/60">
              <Terminal className="size-3.5" /> Console
            </div>
            <div className="p-4 font-mono text-sm min-h-[80px] max-h-56 overflow-auto">
              {!result ? (
                <span className="text-white/40">Output will appear here…</span>
              ) : (
                <>
                  {result.passed ? (
                    <div className="flex items-center gap-2 text-green-400 mb-2"><Check className="size-4" /> {result.status ?? "Accepted"}</div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400 mb-2"><X className="size-4" /> {result.status ?? "Failed"}</div>
                  )}
                  {result.stdout && <pre className="text-[#d4d4d4] whitespace-pre-wrap">{result.stdout}</pre>}
                  {result.compileOutput && <pre className="text-yellow-300 whitespace-pre-wrap">{result.compileOutput}</pre>}
                  {result.stderr && <pre className="text-red-300 whitespace-pre-wrap">{result.stderr}</pre>}
                  {result.message && <div className={`mt-2 ${result.passed ? "text-green-400" : "text-white/60"}`}>{result.message}</div>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
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
