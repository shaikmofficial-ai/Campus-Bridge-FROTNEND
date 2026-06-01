import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Phone, Video, Send, Paperclip, Smile, Search } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Messages · CampusBridge" }] }),
  component: Chat,
});

const convos = [
  { name: "Arun Prakash", last: "Hey Karthik! How are you doing?", time: "10:30 AM", online: true, img: 11, unread: 2 },
  { name: "Swathi R.", last: "Shared a resource", time: "Yesterday", img: 32 },
  { name: "Placement Group", last: "Let's connect tomorrow…", time: "2d ago", img: 14 },
  { name: "Alumni Connect", last: "Great work on the project!", time: "3d ago", img: 25 },
  { name: "Nivetha S.", last: "Sure, that would be great!", time: "3d ago", img: 47 },
];

const messages = [
  { from: "them", text: "Hey Karthik! How are you doing?", time: "10:28 AM" },
  { from: "me", text: "I'm good! How about you?", time: "10:29 AM" },
  { from: "them", text: "Let's connect tomorrow and discuss the project.", time: "10:29 AM" },
  { from: "me", text: "Sure, that would be great! 🚀", time: "10:30 AM" },
];

function Chat() {
  const [active, setActive] = useState(0);
  return (
    <AppShell title="Messages" subtitle="Secure real-time chat with mentors, peers and groups.">
      <div className="rounded-3xl border border-border bg-card overflow-hidden grid md:grid-cols-[320px_1fr] min-h-[560px]">
        <aside className="border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input placeholder="Search messages…" className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convos.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setActive(i)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border/60 ${active === i ? "bg-accent/50" : "hover:bg-muted/60"}`}
              >
                <div className="relative">
                  <img src={`https://i.pravatar.cc/80?img=${c.img}`} alt="" className="size-10 rounded-full object-cover" />
                  {c.online && <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success border-2 border-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold truncate">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">{c.time}</div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{c.last}</div>
                </div>
                {c.unread && <span className="text-[10px] bg-primary text-primary-foreground rounded-full size-5 grid place-items-center">{c.unread}</span>}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex flex-col">
          <header className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={`https://i.pravatar.cc/80?img=${convos[active].img}`} alt="" className="size-10 rounded-full object-cover" />
              <div>
                <div className="font-semibold text-sm">{convos[active].name}</div>
                <div className="text-[11px] text-success">Online</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" /> <Video className="size-4" />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-surface">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[70%] ${m.from === "me" ? "ml-auto" : ""}`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${m.from === "me" ? "bg-gradient-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                  {m.text}
                </div>
                <div className={`text-[10px] text-muted-foreground mt-1 ${m.from === "me" ? "text-right" : ""}`}>{m.time}</div>
              </div>
            ))}
          </div>

          <footer className="p-3 border-t border-border flex items-center gap-2">
            <button className="size-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground"><Paperclip className="size-4" /></button>
            <input placeholder="Type a message…" className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none" />
            <button className="size-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground"><Smile className="size-4" /></button>
            <button className="size-10 grid place-items-center rounded-full bg-gradient-primary text-primary-foreground"><Send className="size-4" /></button>
          </footer>
        </section>
      </div>
    </AppShell>
  );
}
