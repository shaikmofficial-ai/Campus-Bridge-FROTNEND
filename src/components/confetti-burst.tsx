import { useEffect, useState } from "react";

/**
 * Dependency-free confetti burst. Renders ~80 colored pieces that fall and
 * fade, then unmounts itself. Mount it conditionally for ~2.5s.
 */
export function ConfettiBurst({ onDone }: { onDone?: () => void }) {
  const [pieces] = useState(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.8 + Math.random() * 1.2,
      rotate: Math.random() * 360,
      color: ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#a855f7", "#ec4899"][i % 6],
      size: 6 + Math.random() * 8,
    })),
  );

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <style>{`
        @keyframes cb-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rotate}deg)`,
            animation: `cb-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
