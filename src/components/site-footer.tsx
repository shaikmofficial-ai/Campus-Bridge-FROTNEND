import { Link } from "@tanstack/react-router";
import logo from "@/assets/mgr-logo.png";
x
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface" style={{ background: "#0B1220" }}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MGR logo" width={40} height={40} className="rounded-md" />
            <div>
              <div className="font-bold">CampusBridge</div>
              <div className="text-xs text-muted-foreground">Dr. M.G.R. Educational &amp; Research Institute</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            A secure mentorship and alumni networking platform exclusively for the Dr. M.G.R. community.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Platform</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/mentorship" className="hover:text-foreground">Mentorship Hub</Link></li>
            <li><Link to="/placements" className="hover:text-foreground">Placements</Link></li>
            <li><Link to="/resources" className="hover:text-foreground">Resources</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Community</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/forum" className="hover:text-foreground">Public Forum</Link></li>
            <li><Link to="/forum" className="hover:text-foreground">Private Groups</Link></li>
            <li><Link to="/chat" className="hover:text-foreground">Messages</Link></li>
            <li><Link to="/admin" className="hover:text-foreground">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Dr. M.G.R. Educational and Research Institute. All rights reserved.
      </div>
    </footer>
  );
}
