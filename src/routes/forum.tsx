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
import { Globe, Lock, MessageCircle, Eye, Plus, Loader2, AlertCircle } from "lucide-react";
import { forumApi } from "@/lib/api/campus";
import { avatarUrl, timeAgo } from "@/lib/ui";
import type { ForumGroup, ForumPost } from "@/lib/api/types";

export const Route = createFileRoute("/forum")({
  head: () => ({ meta: [{ title: "Community Forum · CampusBridge" }] }),
  component: Forum,
});

const CATEGORIES = ["GENERAL", "CAREER", "ACADEMICS", "INTERNSHIP", "PLACEMENT"];

function Forum() {
  const [tab, setTab] = useState<"public" | "private">("public");
  const [creating, setCreating] = useState(false);
  const [commentPost, setCommentPost] = useState<ForumPost | null>(null);

  const postsQ = useQuery({ queryKey: ["forum", "public"], queryFn: forumApi.publicPosts });
  const groupsQ = useQuery({ queryKey: ["forum", "groups"], queryFn: forumApi.groups });

  const posts = postsQ.data ?? [];
  const groups = groupsQ.data ?? [];

  return (
    <AppShell title="Community Forum" subtitle="Discuss, ask, share — across batches and departments.">
      <div className="rounded-2xl border border-border bg-card p-2 flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1">
          <button
            onClick={() => setTab("public")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${tab === "public" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Globe className="size-4" /> Public Forum
          </button>
          <button
            onClick={() => setTab("private")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${tab === "private" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Lock className="size-4" /> Groups
          </button>
        </div>
        <Button onClick={() => setCreating(true)} className="rounded-full bg-gradient-primary text-primary-foreground">
          <Plus className="size-4" /> New Post
        </Button>
      </div>

      {tab === "public" ? (
        postsQ.isLoading ? (
          <Loading />
        ) : postsQ.isError ? (
          <ErrorBox msg={postsQ.error instanceof Error ? postsQ.error.message : "Failed to load posts."} />
        ) : posts.length === 0 ? (
          <Empty text="No posts yet. Be the first to start a discussion!" />
        ) : (
          <div className="space-y-3">
            {posts.map((p: ForumPost) => (
              <button
                key={p.id}
                onClick={() => setCommentPost(p)}
                className="w-full text-left rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:shadow-soft transition-shadow"
              >
                <img src={avatarUrl(p.author?.profilePictureUrl, p.author?.id ?? p.id)} alt="" className="size-11 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  {p.category && (
                    <span className="text-[10px] uppercase tracking-wider rounded-full bg-accent text-primary px-2 py-0.5">{p.category}</span>
                  )}
                  <div className="mt-1 font-semibold truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.author?.name ?? "Unknown"}{p.createdAt ? ` · ${timeAgo(p.createdAt)}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground tabular-nums">
                  <span className="flex items-center gap-1"><MessageCircle className="size-3.5" /> {p.commentCount}</span>
                  <span className="flex items-center gap-1"><Eye className="size-3.5" /> {p.views}</span>
                </div>
              </button>
            ))}
          </div>
        )
      ) : groupsQ.isLoading ? (
        <Loading />
      ) : groups.length === 0 ? (
        <Empty text="No groups available yet." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((g: ForumGroup) => (
            <div key={g.id} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <div className="size-12 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Lock className="size-5" /></div>
              <div className="flex-1">
                <div className="font-semibold">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.memberCount} members · {g.description || "private group"}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewPostDialog open={creating} onOpenChange={setCreating} groups={groups} />
      <CommentDialog post={commentPost} onClose={() => setCommentPost(null)} />
    </AppShell>
  );
}

function NewPostDialog({ open, onOpenChange, groups }: { open: boolean; onOpenChange: (v: boolean) => void; groups: ForumGroup[] }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [isPublic, setIsPublic] = useState(true);
  const [groupId, setGroupId] = useState<string>("");

  const reset = () => {
    setTitle(""); setContent(""); setCategory("GENERAL"); setIsPublic(true); setGroupId("");
  };

  const mutation = useMutation({
    mutationFn: () =>
      forumApi.createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        isPublic,
        groupId: groupId ? Number(groupId) : null,
      }),
    onSuccess: () => {
      toast.success("Post published");
      queryClient.invalidateQueries({ queryKey: ["forum", "public"] });
      reset();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not publish post"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Post</DialogTitle>
          <DialogDescription>Share a question or insight with the community.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="How to prepare for coding interviews?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Write your post…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Group (optional)</Label>
              <select id="group" value={groupId} onChange={(e) => { setGroupId(e.target.value); if (e.target.value) setIsPublic(false); }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Public (no group)</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="size-4 accent-primary" />
            Make this post public
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !title.trim() || !content.trim()}
            className="bg-gradient-primary text-primary-foreground"
          >
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Publishing…</> : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommentDialog({ post, onClose }: { post: ForumPost | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const mutation = useMutation({
    mutationFn: () => forumApi.addComment(post!.id, content.trim()),
    onSuccess: () => {
      toast.success("Comment added");
      queryClient.invalidateQueries({ queryKey: ["forum", "public"] });
      setContent("");
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add comment"),
  });

  return (
    <Dialog open={!!post} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{post?.title}</DialogTitle>
          <DialogDescription>{post?.author?.name ? `By ${post.author.name}` : ""}</DialogDescription>
        </DialogHeader>
        {post?.content && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>}
        <div className="space-y-2 mt-2">
          <Label htmlFor="comment">Add a comment</Label>
          <Textarea id="comment" value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="Share your thoughts…" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !content.trim()} className="bg-gradient-primary text-primary-foreground">
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Posting…</> : "Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
