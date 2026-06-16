import { Link } from "@tanstack/react-router";
import { avatarUrl } from "@/lib/ui";

/**
 * A clickable circular avatar that routes to a peer's public portfolio
 * (/profile/$userId). Use everywhere a user's photo is shown so any avatar
 * across the app opens that person's read-only profile.
 *
 * If `userId` is missing (e.g. anonymous/unknown author) it renders a plain,
 * non-clickable image so nothing breaks.
 */
export function AvatarLink({
  userId,
  picture,
  seed,
  size = 120,
  className = "",
  stopPropagation = false,
}: {
  userId?: number | null;
  picture?: string | null;
  seed: string | number;
  size?: number;
  className?: string;
  /** Set true when inside another clickable element (e.g. a card/row). */
  stopPropagation?: boolean;
}) {
  const img = (
    <img
      src={avatarUrl(picture, seed, size)}
      alt=""
      className={`object-cover ${className}`}
    />
  );

  if (userId == null) return img;

  return (
    <Link
      to="/profile/$userId"
      params={{ userId: String(userId) }}
      onClick={(e) => { if (stopPropagation) e.stopPropagation(); }}
      className="shrink-0 rounded-full transition-transform hover:scale-105 hover:ring-2 hover:ring-primary/40"
      title="View profile"
    >
      {img}
    </Link>
  );
}
