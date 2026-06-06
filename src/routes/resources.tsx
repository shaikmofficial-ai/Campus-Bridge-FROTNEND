import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
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
import {
  FileText, Video, BookOpen, FileBox, ListChecks, Download, Bookmark, BookmarkCheck,
  Upload, Loader2, AlertCircle,
} from "lucide-react";
import { resourceApi } from "@/lib/api/campus";
import { apiDownload } from "@/lib/api/client";
import { titleCase } from "@/lib/ui";
import type { ResourceItem } from "@/lib/api/types";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resource Library · CampusBridge" }] }),
  component: Resources,
});

const TYPES = ["NOTES", "VIDEO", "BOOK", "TEMPLATE", "QUESTION_BANK"] as const;

const typeIcon: Record<string, typeof FileText> = {
  NOTES: FileText,
  VIDEO: Video,
  BOOK: BookOpen,
  TEMPLATE: FileBox,
  QUESTION_BANK: ListChecks,
};

function Resources() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [uploading, setUploading] = useState(false);

  const allQ = useQuery({ queryKey: ["resources", "all"], queryFn: () => resourceApi.list(), enabled: !savedOnly });
  const savedQ = useQuery({ queryKey: ["resources", "saved"], queryFn: resourceApi.saved, enabled: savedOnly });

  const source = savedOnly ? savedQ : allQ;
  const items = source.data ?? [];
  const visible = filter === "All" ? items : items.filter((r) => r.type === filter);

  const toggleSave = useMutation({
    mutationFn: ({ id, saved }: { id: number; saved: boolean }) =>
      saved ? resourceApi.unsave(id) : resourceApi.save(id),
    onSuccess: (_d, v) => {
      toast.success(v.saved ? "Removed from saved" : "Saved");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Action failed"),
  });

  const download = async (r: ResourceItem) => {
    try {
      const { blob, filename } = await apiDownload(`/api/resources/${r.id}/download`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || r.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    }
  };

  return (
    <AppShell title="Resource Library" subtitle="Curated notes, videos and books from seniors and mentors.">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {["All", ...TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-xs rounded-full px-3 py-1.5 font-medium border ${filter === t ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {t === "All" ? "All" : titleCase(t.replace("_", " "))}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSavedOnly((s) => !s)}
            className={`text-xs rounded-full px-3 py-1.5 font-medium border flex items-center gap-1 ${savedOnly ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
          >
            <Bookmark className="size-3.5" /> Saved
          </button>
          <Button onClick={() => setUploading(true)} className="rounded-full bg-gradient-primary text-primary-foreground">
            <Upload className="size-4" /> Upload
          </Button>
        </div>
      </div>

      {source.isLoading ? (
        <Loading />
      ) : source.isError ? (
        <ErrorBox msg={source.error instanceof Error ? source.error.message : "Failed to load resources."} />
      ) : visible.length === 0 ? (
        <Empty text={savedOnly ? "You haven't saved any resources yet." : "No resources found."} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((r) => {
            const Icon = typeIcon[r.type] ?? FileText;
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="size-11 grid place-items-center rounded-xl bg-accent text-primary"><Icon className="size-5" /></div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{titleCase(r.type.replace("_", " "))}</span>
                </div>
                <div className="mt-4 font-semibold leading-snug">{r.title}</div>
                {r.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</div>}
                <div className="text-xs text-muted-foreground mt-1">
                  {[r.department, r.fileSize, `${r.downloadCount} downloads`].filter(Boolean).join(" · ")}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">by {r.uploaderName ?? "Unknown"}</div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => download(r)}>
                    <Download className="size-3.5" /> Download
                  </Button>
                  <Button
                    size="sm"
                    variant={r.saved ? "default" : "outline"}
                    className={`rounded-full ${r.saved ? "bg-primary text-primary-foreground" : ""}`}
                    disabled={toggleSave.isPending}
                    onClick={() => toggleSave.mutate({ id: r.id, saved: r.saved })}
                    aria-label={r.saved ? "Unsave" : "Save"}
                  >
                    {r.saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadDialog open={uploading} onOpenChange={setUploading} />
    </AppShell>
  );
}

function UploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [type, setType] = useState<string>("NOTES");
  const [file, setFile] = useState<File | null>(null);

  const reset = () => {
    setTitle(""); setDescription(""); setDepartment(""); setType("NOTES"); setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: () => resourceApi.upload({ title: title.trim(), description: description.trim(), department: department.trim(), type, file: file! }),
    onSuccess: () => {
      toast.success("Resource uploaded");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      reset();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
          <DialogDescription>Share notes, videos or books with the community.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="r-title">Title</Label>
            <Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Data Structures Complete Notes" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-desc">Description</Label>
            <Textarea id="r-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Short description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="r-dept">Department</Label>
              <Input id="r-dept" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="CSE" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-type">Type</Label>
              <select id="r-type" value={type} onChange={(e) => setType(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {TYPES.map((t) => <option key={t} value={t}>{titleCase(t.replace("_", " "))}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-file">File</Label>
            <Input id="r-file" ref={fileRef} type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !title.trim() || !department.trim() || !file}
            className="bg-gradient-primary text-primary-foreground"
          >
            {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Uploading…</> : "Upload"}
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
