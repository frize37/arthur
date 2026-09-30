"use client";

import { createContext, useContext } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { CHAPTERS } from "../lib/types";
import { shekel } from "../lib/finance";

export function ProgressBar({ chapter }: { chapter: number | undefined }) {
  // The chapters are the folder's divider tabs: finished ones carry a stamp,
  // the open one stands taller in cap yellow.
  return (
    <ol className="progress" hidden={chapter === undefined} aria-label="התקדמות בתיק">
      {CHAPTERS.map((label, i) => {
        const status = i === chapter ? "active" : chapter !== undefined && i < chapter ? "done" : "";
        return (
          <li key={label} className={"pstep" + (status ? " " + status : "")} aria-current={status === "active" ? "step" : undefined}>
            <span className="pbadge" aria-hidden>
              <span className="pnum">{i + 1}</span>
              <svg><use href="#ic-check2" /></svg>
            </span>
            <span className="plabel">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Where Arthur stands. On question stages the wizard gives him a column of
 * his own beside the sheet, so a stage fits one screen; each stage still
 * decides what he says and how he looks, and portals it into that column.
 */
export const BuddySlotContext = createContext<HTMLElement | null>(null);

export function SideBuddy({ children }: { children: React.ReactNode }) {
  const slot = useContext(BuddySlotContext);
  return slot ? createPortal(children, slot) : <>{children}</>;
}

export function BuddyRow({ bubble, mood = "bear", size }: { bubble: string; mood?: "bear" | "bear-celebrate" | "bear-detective"; size?: "doc" }) {
  return (
    <SideBuddy>
      <div className={"buddy-row" + (size === "doc" ? " buddy-row--doc" : "")}>
        <Image
          src="/brand/arthur-bear-full.png"
          alt="ארתור"
          width={240}
          height={240}
          className={`buddy-icon buddy-icon--${mood}`}
        />
        <div className="bubble">{bubble}</div>
      </div>
    </SideBuddy>
  );
}

export function NavRow({
  onBack,
  onNext,
  nextLabel = "המשך",
  nextDisabled = false,
  showBack = true,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="navrow">
      {showBack ? (
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          חזרה
        </button>
      ) : (
        <span />
      )}
      <span className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </button>
    </div>
  );
}

export interface ChoiceOption {
  value: string;
  icon: string;
  title: string;
  subtitle: string;
}

export function ChoiceGroup({
  value,
  onSelect,
  options,
}: {
  value: string | null;
  onSelect: (v: string) => void;
  options: ChoiceOption[];
}) {
  return (
    <div className="choices">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="choice"
          aria-pressed={value === opt.value}
          onClick={() => onSelect(opt.value)}
        >
          <span className="choice__icon">
            <svg><use href={`#${opt.icon}`} /></svg>
          </span>
          <span className="choice__text">
            <strong>{opt.title}</strong>
            <small>{opt.subtitle}</small>
          </span>
          <span className="choice__check">
            <svg><use href="#check" /></svg>
          </span>
        </button>
      ))}
    </div>
  );
}

export function ChipRow({
  value,
  onSelect,
  options,
}: {
  value: string | null;
  onSelect: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="chiprow">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="chip"
          aria-pressed={value === opt.value}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  maxLabel,
  minLabel,
  format = shekel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  maxLabel?: string;
  minLabel?: string;
  format?: (n: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slidercard">
      <div className="toprow">
        <span>{label}</span>
        <span className="num">{format(value)}</span>
      </div>
      <input
        type="range"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--val" as string]: `${pct}%` }}
      />
      <div className="rangebounds">
        <span>{maxLabel ?? format(max)}</span>
        <span>{minLabel ?? format(min)}</span>
      </div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {hint && <small className="hint">{hint}</small>}
      {children}
    </div>
  );
}

export function Reveal({ children }: { children: React.ReactNode }) {
  return <div className="reveal">{children}</div>;
}

export function Subhead({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="subhead">
      <span>{title}</span>
      {tag && <span className="tag">{tag}</span>}
    </div>
  );
}
