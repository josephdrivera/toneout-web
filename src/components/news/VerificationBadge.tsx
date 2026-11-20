import {
  VERIFICATION_LABELS,
  type Verification,
} from "../../../convex/lib/taxonomy";

const styles: Record<Verification, string> = {
  automated: "bg-gold/10 text-gold border-gold/25",
  official: "bg-fire/10 text-fire border-fire/25",
  developing: "bg-law/10 text-law border-law/25",
  confirmed: "bg-ems/10 text-ems border-ems/25",
  verified: "bg-ems/15 text-ems border-ems/35",
};

export default function VerificationBadge({
  verification,
}: {
  verification: Verification;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] ${styles[verification]}`}
    >
      {VERIFICATION_LABELS[verification]}
    </span>
  );
}
