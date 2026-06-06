import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logoAsset from "@/assets/mgr-logo-official.png";
const logo = logoAsset;
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { getUser, signOut, type AuthUser } from "@/lib/auth";

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/mentorship", label: "Mentorship" },
  { to: "/placements", label: "Placements" },
  { to: "/resources", label: "Resources" },
  { to: "/forum", label: "Community" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    window.addEventListener("campusbridge:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("campusbridge:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

  const links = user
    ? [{ to: "/", label: "Home" }, { to: "/dashboard", label: "Dashboard" }, ...baseLinks.slice(1)]
    : baseLinks;

  function handleLogout() {
    signOut();
    navigate({ to: "/", replace: true });
  }

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
          {user ? (
            <>
              <div className="text-sm font-medium text-muted-foreground pr-1">
                Hi, <span className="text-foreground">{user.name.split(" ")[0]}</span>
              </div>
              <Button
                size="sm"
                className="rounded-full bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
                asChild
              >
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>Open Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="size-4 mr-1" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
                asChild
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
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
            {user ? (
              <Button
                onClick={() => { setOpen(false); handleLogout(); }}
                className="mt-2 rounded-full"
                variant="outline"
              >
                <LogOut className="size-4 mr-1" /> Sign out
              </Button>
            ) : (
              <Button asChild className="mt-2 rounded-full bg-gradient-primary text-primary-foreground">
                <Link to="/register" onClick={() => setOpen(false)}>Get Started</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
