import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { getUser, type Role } from "@/lib/auth";
import { Loader2 } from "lucide-react";

type Props = {
  children: ReactNode;
  requireRole?: Role;
};

export function AuthGate({ children, requireRole }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate({ to: "/login", search: { redirect: pathname } as never, replace: true });
      setState("denied");
      return;
    }
    if (requireRole && user.role !== requireRole) {
      navigate({ to: "/dashboard", replace: true });
      setState("denied");
      return;
    }
    setState("ok");
  }, [navigate, pathname, requireRole]);

  if (state !== "ok") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin mr-2" />
        <span className="text-sm">Verifying access…</span>
      </div>
    );
  }
  return <>{children}</>;
}
