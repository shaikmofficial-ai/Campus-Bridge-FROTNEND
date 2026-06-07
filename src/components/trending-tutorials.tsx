import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Heart, ExternalLink, Loader2, GraduationCap } from "lucide-react";
import { educationApi } from "@/lib/api/campus";
import type { TrendingArticle } from "@/lib/api/types";

/**
 * "Trending Technical Tutorials" widget backed by the free Dev.to API.
 * Reads the student's skill tags, lets them switch tag, and shows article cards.
 */
export function TrendingTutorials({
  skills,
  defaultTag,
  limit = 6,
}: {
  skills?: string[];
  defaultTag?: string;
  limit?: number;
}) {
  // Normalize skills into Dev.to-style tags (lowercase, no spaces/hashes).
  const tags = useMemo(() => {
    const base = (skills && skills.length > 0 ? skills : ["javascript", "react", "python"])
      .map((s) => s.toLowerCase().replace(/[#\s]/g, ""))
      .filter(Boolean);
    return Array.from(new Set(base)).slice(0, 6);
  }, [skills]);

  const [activeTag, setActiveTag] = useState<string>(defaultTag ?? tags[0] ?? "javascript");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trending", activeTag, limit],
    queryFn: () => educationApi.trending(activeTag, limit),
    staleTime: 1000 * 60 * 10, // 10 min — these don't change often
  });

  const articles = (data ?? []).slice(0, limit);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="size-9 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><GraduationCap className="size-4" /></div>
          <div>
            <h3 className="font-semibold">Trending Technical Tutorials</h3>
            <p className="text-xs text-muted-foreground">Fresh guides from the dev community, matched to your skills.</p>
          </div>
        </div>
        <a href="https://dev.to" target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground hover:text-foreground">via Dev.to</a>
      </div>

      {/* Tag switcher */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTag(t)}
            className={`text-xs rounded-full px-3 py-1 font-medium border ${activeTag === t ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
          >
            #{t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-8 grid place-items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Loading tutorials…</div>
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Couldn't load tutorials right now.</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No tutorials found for #{activeTag}.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {articles.map((a: TrendingArticle) => (
            <a
              key={a.id}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-border bg-surface p-4 flex flex-col hover:shadow-soft hover:border-primary/40 transition-all"
            >
              <div className="flex items-start gap-2">
                <BookOpen className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary">{a.title}</div>
              </div>
              {a.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{a.description}</p>}
              <div className="mt-auto pt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                {a.authorAvatar && <img src={a.authorAvatar} alt="" className="size-5 rounded-full object-cover" />}
                <span className="truncate flex-1">{a.authorName ?? "Unknown"}</span>
                {a.readingTimeMinutes != null && (
                  <span className="flex items-center gap-0.5"><Clock className="size-3" /> {a.readingTimeMinutes}m</span>
                )}
                {a.reactionsCount != null && (
                  <span className="flex items-center gap-0.5"><Heart className="size-3" /> {a.reactionsCount}</span>
                )}
                <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
