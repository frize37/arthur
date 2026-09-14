export function confettiBurst() {
  const colors = ["#DE9F35", "#2C7268", "#2F8F5B", "#C24B3E"];
  for (let i = 0; i < 18; i++) {
    const d = document.createElement("div");
    d.className = "confetti";
    d.style.left = 45 + Math.random() * 10 + "vw";
    d.style.top = "18vh";
    d.style.background = colors[i % colors.length];
    d.style.setProperty("--rot", Math.random() * 360 - 180 + "deg");
    d.style.transform = "translateX(" + (Math.random() * 160 - 80) + "px)";
    d.style.animationDuration = 0.8 + Math.random() * 0.6 + "s";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1600);
  }
}

export function heroLandingEffects(stageEl: HTMLElement) {
  const heroBand = stageEl.closest(".hero-band") as HTMLElement | null;
  const wave = document.createElement("div");
  wave.className = "shockwave";
  stageEl.appendChild(wave);
  setTimeout(() => wave.remove(), 650);

  for (let i = 0; i < 3; i++) {
    const puff = document.createElement("div");
    puff.className = "dust";
    puff.style.left = 44 + i * 10 + "%";
    puff.style.animationDelay = i * 0.06 + "s";
    stageEl.appendChild(puff);
    setTimeout(() => puff.remove(), 700);
  }

  if (heroBand) {
    heroBand.classList.add("impact-shake");
    setTimeout(() => heroBand.classList.remove("impact-shake"), 420);
  }
  confettiBurst();
}
