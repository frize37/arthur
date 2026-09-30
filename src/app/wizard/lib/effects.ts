/**
 * Arthur's one celebration: a rubber stamp lands on the case, then lifts.
 * It replaces confetti — the moment is marked the way an office marks a
 * file, which keeps a money decision from feeling like a game.
 */
export function stampFlash(text = "נבדק") {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = document.createElement("div");
  el.className = "stamp-flash";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `${text}<small>ע״י ארתור</small>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}
