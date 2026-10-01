import Link from "next/link";
import type { TeamCat } from "@/data/team";

/* Plain <img>, like the rest of the cat art (CSS object-fit crop). */
export function TeamCard({ cat }: { cat: TeamCat }) {
  return (
    <Link
      id={cat.id}
      className="cat-card"
      href={`/team/${cat.slug}`}
      aria-label={`${cat.color} — ${cat.role} ดูโปรไฟล์`}
    >
      <img src={cat.image} alt={cat.color} loading="lazy" />
      <span className="cat-card-text">
        <strong>{cat.color}</strong>
        <small>{cat.role}</small>
      </span>
    </Link>
  );
}
