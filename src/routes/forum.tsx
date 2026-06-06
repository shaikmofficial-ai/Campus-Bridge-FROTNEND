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
import { Globe, Lock, MessageCircle, Eye, Plus, Loader2, AlertCircle, ArrowLeft, Users } from "lucide-react";
import { forumApi, profileApi } from "@/lib/api/campus";
import { avatarUrl, timeAgo } from "@/lib/ui";
import type { ForumComment, ForumGroup, ForumPost } from "@/lib/api/types";

export const Route = createFileRoute("/forum")({
  head: () => ({ meta: [{ title: "Community Forum · CampusBridge" }] }),
  component: Forum,
});

const CATEGORIES = ["GENERAL", "CAREER", "ACADEMICS", "INTERNSHIP", "PLACEMENT"];

function Forum() {
  const [tab, setTab] = useState<"public" | "private">("public");
  const [creating, setCreating] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [postGroupId, setPostGroupId] = useState<number | undefined>(undefined);
  const [commentPost, setCommentPost] = useState<ForumPost | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ForumGroup | null>(null);

  const postsQ = useQuery({ queryKey: ["forum", "public"], queryFn: forumApi.publicPosts });
  const groupsQ = useQuery({ queryKey: ["forum", "groups"], queryFn: forumApi.groups });
  const meQ = useQuery({ queryKey: ["profile", "me"], queryFn: profileApi.me });
  const groupPostsQ = useQuery({
    queryKey: ["forum", "group-posts", selectedGroup?.id],
    queryFn: () => forumApi.groupPosts(selectedGroup!.id),
    enabled: !!selectedGroup,
  });

  const canWrite = !meQ.data || meQ.data.role === "ADMIN" || meQ.data.accountStatus === "APPROVED";

  const posts = postsQ.data ?? [];
  const groups = groupsQ.data ?? [];
  const groupPosts = groupPostsQ.data ?? [];

  const openNewPost = (groupId?: number) => {
    setPostGroupId(groupId);
    setCreating(true);
  };

  return (
    <AppShell title="Community Forum" subtitle="Discuss, ask, share — across batches and departments.">
      {!canWrite && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-foreground mb-5 flex items-start gap-2">
          <Lock className="size-4 mt-0.5 text-warning shrink-0" />
          <span>Your account is pending admin approval. You can read everything, but posting, commenting and creating groups unlock once an admin approves you.</span>
        </div>
      )}
      <div className="rounded-2xl border border-border bg-card p-2 flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1">
          <button
            onClick={() => { setTab("public"); setSelectedGroup(null); }}
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
        {tab === "public" ? (
          <Button onClick={() => openNewPost(undefined)} disabled={!canWrite} className="rounded-full bg-gradient-primary text-primary-foreground">
            <Plus className="size-4" /> New Post
          </Button>
        ) : (
          <Button onClick={() => setCreatingGroup(true)} disabled={!canWrite} className="rounded-full bg-gradient-primary text-primary-foreground">
            <Plus className="size-4" /> Create Group
          </Button>
        )}
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
            {posts.map((p) => (
              <PostRow key={p.id} post={p} onClick={() => setCommentPost(p)} />
            ))}
          </div>
        )
      ) : selectedGroup ? (
        // --- Single group view: its posts ---
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setSelectedGroup(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> All groups
            </button>
            <Button onClick={() => openNewPost(selectedGroup.id)} disabled={!canWrite} size="sm" className="rounded-full bg-gradient-primary text-primary-foreground">
              <Plus className="size-4" /> New Post in group
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 mb-4 flex items-center gap-4">
            <div className="size-12 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Lock className="size-5" /></div>
            <div>
              <div className="font-semibold text-lg">{selectedGroup.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="size-3" /> {selectedGroup.memberCount} members · {selectedGroup.description || "private group"}
              </div>
            </div>
          </div>
          {groupPostsQ.isLoading ? (
            <Loading />
          ) : groupPosts.length === 0 ? (
            <Empty text="No posts in this group yet. Start the first discussion!" />
          ) : (
            <div className="space-y-3">
              {groupPosts.map((p) => (
                <PostRow key={p.id} post={p} onClick={() => setCommentPost(p)} />
              ))}
            </div>
          )}
        </div>
      ) : groupsQ.isLoading ? (
        <Loading />
      ) : groups.length === 0 ? (
        <Empty text="No groups yet. Create the first private forum!" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g)}
              className="text-left rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:shadow-soft transition-shadow"
            >
              <div className="size-12 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Lock className="size-5" /></div>
              <div className="flex-1">
                <div className="font-semibold">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.memberCount} members · {g.description || "private group"}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <NewPostDialog open={creating} onOpenChange={setCreating} groups={groups} defaultGroupId={postGroupId} />
      <CreateGroupDialog open={creatingGroup} onOpenChange={setCreatingGroup} />
      <CommentDialog post={commentPost} onClose={() => setCommentPost(null)} canWrite={canWrite} />
    </AppShell>
  );
}

function PostRow({ post: p, onClick }: { post: ForumPost; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
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
  );
}

function NewPostDialog({
  open, onOpenChange, groups, defaultGroupId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  groups: ForumGroup[];
  defaultGroupId?: number;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [isPublic, setIsPublic] = useState(true);
  const [groupId, setGroupId] = useState<string>("");

  // Sync the group selection whenever the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setGroupId(defaultGroupId ? String(defaultGroupId) : "");
      setIsPublic(!defaultGroupId);
    }
  }, [open, defaultGroupId]);

  const lockedToGroup = !!defaultGroupId;

  const mutation = useMutation({
    mutationFn: () =>
      forumApi.createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        isPublic: groupId ? false : isPublic,
        groupId: groupId ? Number(groupId) : null,
      }),
    onSuccess: () => {
      toast.success("Post published");
      queryClient.invalidateQueries({ queryKey: ["forum", "public"] });
      if (groupId) queryClient.invalidateQueries({ queryKey: ["forum", "group-posts", Number(groupId)] });
      setTitle(""); setContent(""); setCategory("GENERAL");
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not publish post"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lockedToGroup ? "New Post in Group" : "New Post"}</DialogTitle>
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
            {!lockedToGroup && (
              <div className="space-y-2">
                <Label htmlFor="group">Group (optional)</Label>
                <select id="group" value={groupId} onChange={(e) => { setGroupId(e.target.value); if (e.target.value) setIsPublic(false); }}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Public (no group)</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
          </div>
          {!groupId && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="size-4 accent-primary" />
              Make this post public
            </label>
          )}
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

function CreateGroupDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const mutation = useMutation({
    mutationFn: () => forumApi.createGroup({ name: name.trim(), description: description.trim(), isPrivate }),
    onSuccess: () => {
      toast.success("Group created");
      queryClient.invalidateQueries({ queryKey: ["forum", "groups"] });
      setName(""); setDescription(""); setIsPrivate(true);
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create group"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Group</DialogTitle>
          <DialogDescription>Start a private forum for a batch, club or project team.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="g-name">Group name</Label>
            <Input id="g-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="CSE 2025 Placement Prep" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="g-desc">Description</Label>
            <Textarea id="g-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this group about?" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="size-4 accent-primary" />
            Private group
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !name.trim()} className="bg-gradient-primary text-primary-foreground">
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Creating…</> : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommentDialog({ post, onClose, canWrite }: { post: ForumPost | null; onClose: () => void; canWrite: boolean }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const commentsQ = useQuery({
    queryKey: ["forum", "comments", post?.id],
    queryFn: () => forumApi.comments(post!.id),
    enabled: !!post,
  });
  const comments = commentsQ.data ?? [];

  const mutation = useMutation({
    mutationFn: () => forumApi.addComment(post!.id, content.trim()),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["forum", "comments", post?.id] });
      queryClient.invalidateQueries({ queryKey: ["forum", "public"] });
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

        <div className="mt-2">
          <div className="text-sm font-semibold mb-2 flex items-center gap-1">
            <MessageCircle className="size-4" /> Comments {comments.length > 0 ? `(${comments.length})` : ""}
          </div>
          {commentsQ.isLoading ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2 py-3"><Loader2 className="size-4 animate-spin" /> Loading comments…</div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No comments yet. {canWrite ? "Be the first to reply." : ""}</p>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {comments.map((c: ForumComment) => (
                <div key={c.id} className="flex gap-3">
                  <img src={avatarUrl(c.authorProfilePictureUrl, c.authorId ?? c.id)} alt="" className="size-8 rounded-full object-cover shrink-0" />
                  <div className="rounded-2xl bg-surface px-3 py-2 flex-1">
                    <div className="text-xs font-medium">{c.authorName ?? "Unknown"} <span className="text-muted-foreground font-normal">· {timeAgo(c.createdAt)}</span></div>
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap">{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {canWrite ? (
          <div className="space-y-2 mt-2">
            <Label htmlFor="comment">Add a comment</Label>
            <div className="flex gap-2">
              <Textarea id="comment" value={content} onChange={(e) => setContent(e.target.value)} rows={2} placeholder="Share your thoughts…" />
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !content.trim()} className="bg-gradient-primary text-primary-foreground self-end">
                {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Post"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-2.5 text-sm text-foreground mt-2 flex items-center gap-2">
            <Lock className="size-4 text-warning shrink-0" /> Commenting unlocks after an admin approves your account.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
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
