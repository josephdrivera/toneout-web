import {
  CATEGORY_LABELS,
  type Category,
} from "../../../convex/lib/taxonomy";

function chipStyle(category: Category): string {
  switch (category) {
    case "structure-fire":
    case "brush-fire":
    case "hazmat":
      return "bg-fire/10 text-fire";
    case "ems":
      return "bg-ems/10 text-ems";
    case "mva-rescue":
    case "water-rescue":
      return "bg-law/10 text-law";
    default:
      return "bg-surfaceLight text-textMuted";
  }
}

export default function CategoryChip({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${chipStyle(category)}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
