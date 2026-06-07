import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { reportApi } from "@/lib/api/campus";

const REASONS = ["Spam", "Inappropriate", "Harassment", "Misinformation", "Copyright", "Other"];

/**
 * Small flag button + dialog to report a piece of content (forum post or
 * resource). Stops click propagation so it works inside clickable cards.
 */
export function ReportButton({
  targetType,
  targetId,
  label,
  className,
}: {
  targetType: "FORUM_POST" | "RESOURCE";
  targetId: number;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Spam");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: () => reportApi.create({ targetType, targetId, reason, description: description.trim() || undefined }),
    onSuccess: () => {
      toast.success("Reported. Our moderators will review it.");
      setDescription("");
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not submit report"),
  });

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={`inline-flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors ${className ?? ""}`}
        aria-label="Report"
        title="Report"
      >
        <Flag className="size-3.5" />
        {label && <span className="text-xs">{label}</span>}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Report content</DialogTitle>
            <DialogDescription>Flag this for moderator review. Reports are anonymous to other users.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="report-reason">Reason</Label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report-desc">Details (optional)</Label>
              <Textarea id="report-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What's wrong with this?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="bg-destructive text-white hover:opacity-95">
              {mutation.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" /> Submitting…</> : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
