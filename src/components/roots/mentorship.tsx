import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Star, Search } from "lucide-react";

export const Route = createFileRoute("/mentorship")({
  head: () => ({ meta: [{ title: "Mentorship Hub · CampusBridge" }] }),
  component: Mentorship,
});

const mentors = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  name: ["Arun Prakash", "Swathi R.", "Vigneshwaran", "Nivetha S.", "Rahul K.", "Priya M.", "Aditya V.", "Meera S."][i],
  role: ["SWE", "Data Analyst", "SDE", "Designer", "PM", "ML Engineer", "DevOps", "Researcher"][i],
  co: ["Zoho", "Deloitte", "Microsoft", "Flipkart", "Razorpay", "Google", "AWS", "Intel"][i],
  rating: (4.5 + (i % 5) * 0.1).toFixed(1),
  reviews: 60 + i * 17,
  img: [11, 32, 13, 47, 15, 25, 18, 35][i],
  tags: [["React", "Node"], ["SQL", "Python"], ["DSA", "Java"], ["UI/UX"], ["Strategy"], ["ML", "PyTorch"], ["AWS"], ["Research"]][i],
}));

function Mentorship() {
  return (
    <AppShell title="Mentorship Hub" subtitle="Discover mentors across industries who are alumni of MGR.">
      <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-2 mb-6">
        <Search className="size-4 text-muted-foreground ml-2" />
        <input placeholder="Search by name, company, or skill…" className="flex-1 bg-transparent outline-none text-sm py-1.5" />
        <Button className="rounded-full bg-gradient-primary text-primary-foreground">Find Mentor</Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {["All", "Web Development", "Data Science", "Design", "DSA", "Product", "Research"].map((t, i) => (
          <button key={t} className={`text-xs rounded-full px-3 py-1.5 font-medium border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mentors.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-card p-5 text-center hover:shadow-elegant transition-shadow">
            <img src={`https://i.pravatar.cc/120?img=${m.img}`} alt="" className="size-20 rounded-full mx-auto object-cover" />
            <div className="mt-3 font-semibold">{m.name}</div>
            <div className="text-xs text-muted-foreground">{m.role} · {m.co}</div>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs">
              <Star className="size-3 fill-warning text-warning" />
              <span className="font-medium">{m.rating}</span>
              <span className="text-muted-foreground">({m.reviews})</span>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {m.tags.map((t) => <span key={t} className="text-[10px] uppercase rounded-full bg-accent text-primary px-2 py-0.5">{t}</span>)}
            </div>
            <Button size="sm" variant="outline" className="mt-4 rounded-full w-full">Connect</Button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
