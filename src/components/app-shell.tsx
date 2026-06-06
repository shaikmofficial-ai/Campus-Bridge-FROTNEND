import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import logoAsset from "@/assets/mgr-logo-official.png";
const logo = logoAsset;
import {
  LayoutDashboard, Users, MessagesSquare, BookOpen, Briefcase,
  Bell, Bookmark, UserCircle2, Settings, LogOut, Search, ShieldCheck, Loader2, Check,
} from "lucide-react";
import { getUser, signOut, type AuthUser, type Role } from "@/lib/auth";
import { notificationApi } from "@/lib/api/campus";
import { isNotificationRead } from "@/lib/api/normalize";
import { timeAgo } from "@/lib/ui";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/mentorship", icon: Users, label: "Mentors" },
  { to: "/forum", icon: MessagesSquare, label: "Forum" },
  { to: "/resources", icon: BookOpen, label: "Resources" },
  { to: "/placements", icon: Briefcase, label: "Placements" },
  { to: "/chat", icon: MessagesSquare, label: "Messages" },
  { to: "/profile", icon: UserCircle2, label: "Profile" },
  { to: "/admin", icon: ShieldCheck, label: "Admin" },
];

export function AppShell({
  children,
  title,
  subtitle,
  requireRole,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  requireRole?: Role;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null | "loading">("loading");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate({ to: "/login", search: { redirect: pathname } as never, replace: true });
      setUser(null);
      return;
    }
    if (requireRole && u.role !== requireRole) {
      navigate({ to: "/dashboard", replace: true });
      setUser(null);
      return;
    }
    setUser(u);
  }, [navigate, pathname, requireRole]);

  function handleLogout() {
    signOut();
    navigate({ to: "/login", replace: true });
  }

  if (user === "loading" || user === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface text-muted-foreground">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" /> Verifying access…
        </div>
      </div>
    );
  }

  const visibleNav = nav.filter((n) => n.to !== "/admin" || user.role === "admin");

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-[1500px] grid lg:grid-cols-[260px_1fr] gap-6 p-4 lg:p-6">
        <aside className="hidden lg:flex flex-col rounded-3xl bg-card border border-border shadow-soft p-4 sticky top-6 self-start h-[calc(100vh-3rem)]">
          <Link to="/" className="flex items-center gap-3 px-2 py-3">
            <img src={logo} alt="MGR" width={36} height={36} className="rounded-md" />
            <div>
              <div className="text-sm font-bold">CampusBridge</div>
              <div className="text-[10px] text-muted-foreground">Dr. M.G.R. University</div>
            </div>
          </Link>
          <nav className="mt-3 flex-1 space-y-1">
            {visibleNav.map((n) => {
              const active = pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <n.icon className="size-4" /> {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-4 mt-4">
            <div className="text-sm font-semibold">Keep Learning, Keep Growing!</div>
            <p className="text-xs text-primary-foreground/85 mt-1">Your journey has no limits.</p>
            <button className="mt-3 text-xs font-semibold bg-background/15 hover:bg-background/25 rounded-full px-3 py-1.5">
              Explore Now
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </aside>

        <main className="min-w-0">
          <header className="flex items-center gap-3 rounded-2xl bg-card border border-border shadow-soft px-4 py-3 mb-5">
            <Link to="/" className="lg:hidden flex items-center gap-2">
              <img src={logo} alt="MGR" width={28} height={28} className="rounded" />
            </Link>
            <div className="flex items-center gap-2 flex-1 max-w-xl rounded-full bg-muted px-3.5 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                placeholder="Search mentors, resources, forums…"
                className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
              />
            </div>
            <NotificationsBell />
            <button className="size-9 grid place-items-center rounded-full hover:bg-muted">
              <Bookmark className="size-4" />
            </button>
            <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-border">
              <img
                src={`https://i.pravatar.cc/64?u=${encodeURIComponent(user.email)}`}
                alt=""
                className="size-9 rounded-full object-cover"
              />
              <div className="hidden sm:block">
                <div className="text-sm font-semibold leading-tight">{user.name}</div>
                <div className="text-[11px] text-muted-foreground capitalize">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 size-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </header>

          {(title || subtitle) && (
            <div className="mb-6 flex items-end justify-between gap-3">
              <div>
                {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
              </div>
              <Settings className="size-5 text-muted-foreground" />
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}


function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const countQ = useQuery({
    queryKey: ["notifications", "count"],
    queryFn: notificationApi.unreadCount,
    refetchInterval: 30000,
  });
  const listQ = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: notificationApi.list,
    enabled: open,
  });

  const markRead = useMutation({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "count"] });
    },
  });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const count = countQ.data ?? 0;
  const items = listQ.data ?? [];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="relative size-9 grid place-items-center rounded-full hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 grid place-items-center text-[9px] font-bold bg-destructive text-white rounded-full">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-border bg-card shadow-elegant z-50">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="text-sm font-semibold">Notifications</div>
            {count > 0 && <span className="text-[11px] text-muted-foreground">{count} unread</span>}
          </div>
          {listQ.isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">You're all caught up.</div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const read = isNotificationRead(n);
                return (
                  <li key={n.id} className={`px-4 py-3 flex gap-3 ${read ? "" : "bg-accent/30"}`}>
                    <div className={`mt-1 size-2 rounded-full shrink-0 ${read ? "bg-transparent" : "bg-primary"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground">{n.message}</div>
                      {n.createdAt && <div className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</div>}
                    </div>
                    {!read && (
                      <button
                        onClick={() => markRead.mutate(n.id)}
                        className="text-muted-foreground hover:text-primary shrink-0"
                        aria-label="Mark as read"
                        title="Mark as read"
                      >
                        <Check className="size-4" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
