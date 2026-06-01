import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/mgr-logo.png";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/mentorship", label: "Mentorship" },
  { to: "/placements", label: "Placements" },
  { to: "/resources", label: "Resources" },
  { to: "/forum", label: "Community" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Dr. M.G.R. logo" width={44} height={44} className="rounded-md" />
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">Dr. M.G.R.</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Educational &amp; Research Institute
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">Sign in</Link>
          </Button>
          <Button size="sm" className="rounded-full bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95">
            Get Started
          </Button>
        </div>

        <button
          className="lg:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur">
          <div className="px-5 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <Button className="mt-2 rounded-full bg-gradient-primary text-primary-foreground">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
