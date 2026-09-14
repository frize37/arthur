import Image from "next/image";

export type RigMood = "idle" | "clap" | "sad" | "wave";

export function RiggedBear({ mood = "idle" }: { mood?: RigMood }) {
  const cls = "rigged-bear" + (mood === "idle" ? "" : ` rigged-bear--${mood}`);
  return <Image src="/brand/arthur-bear-full.png" alt="ארתור" width={300} height={300} className={cls} />;
}
