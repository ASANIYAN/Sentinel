import Image from "next/image";

export function AddCardSlot() {
  return (
    <div className="flex h-44 w-16 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border text-text-secondary">
      <Image src="/add.svg" alt="Add card" width={20} height={20} />
    </div>
  );
}
