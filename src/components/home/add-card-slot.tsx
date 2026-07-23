import Image from "next/image";

export function AddCardSlot() {
  return (
    <button
      type="button"
      aria-label="Add card"
      className="flex w-16 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border text-text-secondary transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
    >
      <Image src="/add.svg" alt="" width={20} height={20} />
    </button>
  );
}
