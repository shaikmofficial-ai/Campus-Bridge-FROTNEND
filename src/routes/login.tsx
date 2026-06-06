import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import logoAsset from "@/assets/mgr-logo-official.png";
const logo = logoAsset;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, ShieldCheck, GraduationCap, Users, Loader2 } from "lucide-react";
import { loginUser } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
  }),
  head: () => ({
    meta: [
      { title: "Sign In · CampusBridge" },
      { name: "description", content: "Sign in to CampusBridge — the secure mentorship and alumni networking platform for Dr. M.G.R. Educational and Research Institute." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);
      const target = user.role === "admin" ? "/admin" : (redirect || "/dashboard");
      navigate({ to: target, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface">
      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-30 blur-[100px]"
        style={{ background: "oklch(0.65 0.18 264 / 0.25)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "oklch(0.7 0.15 200 / 0.25)" }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-5">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img src={logo} alt="Dr. M.G.R. logo" width={48} height={48} className="rounded-lg shadow-soft" />
            <div className="text-left leading-tight">
              <div className="text-lg font-bold tracking-tight">CampusBridge</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Dr. M.G.R. Educational &amp; Research Institute
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your campus network
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-border bg-card shadow-elegant p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Institute Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@mgr.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-input bg-muted/40 px-4 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  to="/"
                  className="text-xs text-primary hover:text-primary-glow font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-input bg-muted/40 px-4 pr-11 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="size-4 rounded-md border-border accent-primary cursor-pointer"
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer font-normal">
                Remember me for 30 days
              </Label>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-11 rounded-full bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-1 size-4" />
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-muted-foreground">
              Use your registered institute email and password.
            </p>
          </form>


          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Register link */}
          <div className="text-center text-sm text-muted-foreground">
            New to CampusBridge?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:text-primary-glow transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-success" />
            <span>Secure Login</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="size-3.5 text-info" />
            <span>Institute Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" />
            <span>5,000+ Members</span>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link to="/" className="underline hover:text-foreground">Terms</Link>{" "}
          and{" "}
          <Link to="/" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
