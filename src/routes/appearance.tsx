import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useTheme } from "@/components/theme-provider";
import { THEMES } from "@/lib/theme";
import { Check, Palette } from "lucide-react";

export const Route = createFileRoute("/appearance")({
  head: () => ({ meta: [{ title: "Appearance · CampusBridge" }] }),
  component: AppearancePage,
});

function AppearancePage() {
  const [theme, setTheme] = useTheme();

  return (
    <AppShell title="Appearance" subtitle="Pick a theme — your data and layout stay the same.">
      <div className="rounded-3xl bg-card border border-border shadow-soft p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="size-9 grid place-items-center rounded-xl bg-accent text-primary">
            <Palette className="size-5" />
          </div>
          <div>
            <div className="text-base font-semibold">Theme</div>
            <div className="text-xs text-muted-foreground">Switches instantly across the app.</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`group text-left rounded-2xl border p-4 transition-all ${
                  active
                    ? "border-primary ring-2 ring-primary/30 bg-accent"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
              >
                <div className="flex h-24 rounded-xl overflow-hidden shadow-soft mb-3">
                  {t.swatch.map((c, i) => (
                    <div key={i} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{t.label}</div>
                  <div
                    className={`size-5 grid place-items-center rounded-full border ${
                      active ? "bg-primary border-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {active && <Check className="size-3" strokeWidth={3} />}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{t.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
