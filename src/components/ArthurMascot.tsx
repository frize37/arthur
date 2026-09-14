import Image from "next/image";

export function ArthurMascot({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/arthur-bear-full.png"
      alt="ארתור"
      width={400}
      height={400}
      className={(className ?? "") + " object-contain"}
    />
  );
}
