import EditorQueue from "../../../components/editor/EditorQueue";

export const metadata = {
  title: "Editor Review Queue | ToneOut",
  robots: { index: false, follow: false },
};

export default function EditorPage() {
  return (
    <main className="relative bg-background pt-20 text-textSecondary">
      <section className="relative mx-auto max-w-[760px] px-6 pt-12 pb-20">
        <h1 className="mb-2 text-[28px] font-extrabold leading-tight tracking-[-1px] text-textPrimary">
          Review Queue
        </h1>
        <p className="mb-10 text-sm text-textMuted">
          Held items need a decision before they publish. Flagged items are
          already live but were auto-published from a level-2 source or look
          like possible duplicates.
        </p>
        <EditorQueue />
      </section>
    </main>
  );
}
