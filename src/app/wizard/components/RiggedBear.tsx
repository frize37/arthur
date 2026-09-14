export type RigMood = "idle" | "clap" | "sad" | "wave";

export function RiggedBear({ mood = "idle" }: { mood?: RigMood }) {
  const cls = "rig" + (mood === "idle" ? "" : ` ${mood}`);
  return (
    <svg viewBox="0 0 120 150">
      <g className={cls}>
        <g className="armL">
          <rect x="14" y="100" width="16" height="26" rx="8" fill="#8B5A2B" />
          <ellipse cx="18" cy="118" rx="11" ry="9" fill="#8B5A2B" />
        </g>
        <g className="armR">
          <rect x="90" y="100" width="16" height="26" rx="8" fill="#8B5A2B" />
          <ellipse cx="102" cy="118" rx="11" ry="9" fill="#8B5A2B" />
        </g>
        <ellipse cx="60" cy="118" rx="32" ry="24" fill="#8B5A2B" />
        <ellipse cx="60" cy="124" rx="19" ry="13" fill="#1596A9" />
        <g className="earL">
          <circle cx="26" cy="30" r="13" fill="#8B5A2B" />
          <circle cx="26" cy="30" r="6" fill="#C88F52" />
        </g>
        <g className="earR">
          <circle cx="94" cy="30" r="13" fill="#8B5A2B" />
          <circle cx="94" cy="30" r="6" fill="#C88F52" />
        </g>
        <circle cx="60" cy="62" r="42" fill="#8B5A2B" />
        <ellipse cx="60" cy="76" rx="21" ry="16" fill="#E8C79B" />
        <g className="eyes">
          <circle cx="49" cy="58" r="4.2" fill="#291B0E" />
          <circle cx="71" cy="58" r="4.2" fill="#291B0E" />
        </g>
        <ellipse cx="60" cy="70" rx="6.5" ry="4.5" fill="#291B0E" />
        <path className="mouthSmile" d="M52 79 q8 6 16 0" stroke="#291B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path className="mouthFrown" d="M52 83 q8 -6 16 0" stroke="#291B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse className="tear" cx="72" cy="63" rx="3" ry="4.2" fill="#6FB6EE" />
        <path d="M20 42 a40 26 0 0 1 80 0 z" fill="#F2B705" />
        <ellipse cx="60" cy="42" rx="42" ry="7" fill="#C98F00" />
        <rect x="52" y="30" width="16" height="8" rx="2" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
