import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import logoAsset from "@/assets/mgr-logo-official.png";
const logo = logoAsset;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { registerUser } from "@/lib/auth";
import type { BackendRole } from "@/lib/api/types";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account · CampusBridge" },
      { name: "description", content: "Join CampusBridge — mentorship, placements and community for Dr. M.G.R. University." },
    ],
  }),
  component: RegisterPage,
});

const ROLES: { value: BackendRole; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "ALUMNI", label: "Alumni" },
  { value: "MENTOR", label: "Mentor" },
  { value: "ADMIN", label: "Admin" },
];

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT" as BackendRole,
    registerNumber: "",
    department: "",
    batch: "",
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }) as typeof form);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        registerNumber: form.registerNumber.trim() || undefined,
        department: form.department.trim() || undefined,
        batch: form.batch.trim() || undefined,
      });
      navigate({ to: user.role === "admin" ? "/admin" : "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface py-10">
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
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 mb-5">
            <img src={logo} alt="Dr. M.G.R. logo" width={48} height={48} className="rounded-lg shadow-soft" />
            <div className="text-left leading-tight">
              <div className="text-lg font-bold tracking-tight">CampusBridge</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Dr. M.G.R. Educational &amp; Research Institute
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Join your campus network</p>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-elegant p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                placeholder="Karthik R"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="h-11 rounded-xl bg-muted/40"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Institute Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@mgru.edu.in"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="h-11 rounded-xl bg-muted/40"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="h-11 rounded-xl bg-muted/40 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">I am a</Label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-muted/40 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registerNumber" className="text-sm font-medium">Register Number</Label>
              <Input
                id="registerNumber"
                placeholder="21CSE1234"
                value={form.registerNumber}
                onChange={(e) => set("registerNumber", e.target.value)}
                className="h-11 rounded-xl bg-muted/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                <Input
                  id="department"
                  placeholder="CSE"
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                  className="h-11 rounded-xl bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch" className="text-sm font-medium">Batch</Label>
                <Input
                  id="batch"
                  placeholder="2025"
                  value={form.batch}
                  onChange={(e) => set("batch", e.target.value)}
                  className="h-11 rounded-xl bg-muted/40"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-11 rounded-full bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" /> Creating account…
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="ml-1 size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-glow transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
