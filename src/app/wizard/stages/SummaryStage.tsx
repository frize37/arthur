"use client";

import { useEffect, useRef, useState } from "react";
import type { StageProps } from "../lib/reducer";
import { GOAL_LABELS, isComplexCase } from "../lib/types";
import { bandFor, monthlyPayment, shekel } from "../lib/finance";
import { stampFlash } from "../lib/effects";
import { BuddyRow, ChipRow } from "../components/ui";
import { RiggedBear } from "../components/RiggedBear";
import { submitCaseToDatabase } from "../lib/submitCase";

function goalLabel(goal: string | null): string {
  return (goal && GOAL_LABELS[goal]) || "המטרה שהגדרתם";
}

export function SummaryStage({ state, set, dispatch, back }: StageProps) {
  const totalMonths = state.docYears * 12 + state.docMonths;
  const payment = monthlyPayment(state.docBalance, state.docRate, totalMonths);
  const totalIncome = state.income + state.extra;
  const ratio = totalIncome > 0 ? payment / totalIncome : 0;
  const band = bandFor(payment, state.comfortPayment, state.maxStressPayment);
  const complexCase = band === "risk" || isComplexCase(state);
  const summaryMood: "bear" | "bear-celebrate" | "bear-detective" = complexCase ? "bear-detective" : band === "good" ? "bear-celebrate" : "bear";

  const summaryBubble =
    band === "good"
      ? `המספרים נראים נוחים ובתוך מה שהגדרתם. אם המטרה שלכם היא ${goalLabel(state.goal)}, יש כאן מקום אמיתי לשיפור.`
      : band === "watch"
      ? `זה מעל ההחזר הנוח שהגדרתם, אבל עדיין בתוך הסף המקסימלי — בואו נראה מה יועץ יכול להציע ביחס ל${goalLabel(state.goal)}.`
      : `ההחזר הנוכחי חורג מהסף המקסימלי שהגדרתם. בדיוק בשביל זה כדאי לבדוק מחזור, במיוחד לקראת ${goalLabel(state.goal)}.`;

  const bandLabel = band === "good" ? "בתוך ההחזר הנוח שהגדרתם" : band === "watch" ? "מעל הנוח, אך בתוך הסף המקסימלי" : "מעל הסף המקסימלי שהגדרתם";
  const needleDeg = -90 + Math.max(0, Math.min(1, ratio / 0.6)) * 180;

  useEffect(() => {
    if (band === "good" && !state.celebratedSummary) {
      stampFlash();
      dispatch({ type: "CELEBRATE_SUMMARY" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [band]);

  if (state.submitted) {
    return <DonePanel />;
  }

  const ledger = [
    { label: "החזר חודשי משוער", value: shekel(payment), strong: true },
    { label: "הכנסה פנויה כוללת", value: shekel(totalIncome) },
    { label: "ההחזר הנוח שהגדרתם", value: shekel(state.comfortPayment) },
    { label: "הסף המקסימלי שהגדרתם", value: shekel(state.maxStressPayment) },
  ];

  return (
    <section className="stage">
      <BuddyRow mood={summaryMood} bubble={summaryBubble} />

      <div className="sum-grid">
        <div className="sum-panel">
          <h2 className="sum-panel__title">איפה אתם עומדים</h2>
          <div className="sum-gauge">
            <div className="gauge-wrap">
              <div className="gauge">
                <div className="gauge__arc" />
                <div className="gauge__hole" />
                <div className="gauge__needle" style={{ transform: `rotate(${needleDeg}deg)` }} />
                <div className="gauge__hub" />
              </div>
              <div className="gauge-ticks"><span>0%</span><span>35%</span><span>40%</span><span>60%+</span></div>
            </div>
            <div className="sum-ratio">
              <span>יחס החזר מהכנסה</span>
              <b className="num">{(ratio * 100).toFixed(0)}%</b>
              <span className={`band-chip band-${band}`}>{bandLabel}</span>
            </div>
          </div>
          <dl className="sum-ledger">
            {ledger.map((row) => (
              <div key={row.label} className={row.strong ? "is-strong" : undefined}>
                <dt>{row.label}</dt>
                <dd className="num">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="sum-panel sum-panel--send">
          <h2 className="sum-panel__title">שליחת התיק ליועצים</h2>
          <ol className="sum-route" aria-label="מה קורה עכשיו">
            <li><span>1</span>פרטי קשר</li>
            <li><span>2</span>אימות במייל</li>
            <li><span>3</span>התיק יוצא ליועצים</li>
          </ol>
          <p className="sum-note">
            הנתונים נשלחים ליועצים <b>ללא שם או פרטים מזהים</b>, רק למי שמתמחה בתיק כמו שלכם. כל יועץ מגיש הצעת מחיר, ואנחנו מעבירים אליכם את <b>ההצעה המשתלמת ביותר</b>.
          </p>
          <ContactAndVerify state={state} set={set} dispatch={dispatch} />
        </div>
      </div>

      <div className="navrow">
        <button type="button" className="btn btn-ghost" onClick={back}>חזרה</button>
        <span className="spacer" />
        <button type="button" className="btn-link" onClick={() => dispatch({ type: "RESET" })}>
          התחלת תהליך מחדש
        </button>
      </div>
    </section>
  );
}

async function sendVerificationEmail(email: string) {
  const res = await fetch("/api/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "send", email }),
  });
  return res.json() as Promise<{ ok: boolean; token?: string; error?: string }>;
}

async function checkVerificationEmail(token: string, email: string, code: string) {
  const res = await fetch("/api/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "check", token, email, code }),
  });
  return res.json() as Promise<{ ok: boolean }>;
}

function ContactAndVerify({
  state,
  set,
  dispatch,
}: Pick<StageProps, "state" | "set" | "dispatch">) {
  const [showVerify, setShowVerify] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState(state.contactEmail);
  const [emailCodeInput, setEmailCodeInput] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [justResent, setJustResent] = useState(false);

  // Takes the email explicitly instead of reading state.contactEmail — the
  // SET dispatched in handleSubmit hasn't been applied to `state` yet in
  // this same tick, so reading it here would send to the previous value
  // (empty on the very first submit).
  async function startVerification(email: string) {
    setEmailCodeInput("");
    setEmailError(false);
    setSendError(null);
    setSendingCode(true);
    setJustResent(false);
    const result = await sendVerificationEmail(email);
    setSendingCode(false);
    if (!result.ok || !result.token) {
      setSendError(result.error ?? "שליחת קוד האימות נכשלה. נסו שוב.");
      return;
    }
    setToken(result.token);
    setShowVerify(true);
    setJustResent(true);
    setTimeout(() => setJustResent(false), 4000);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = emailRef.current?.value.trim() ?? "";
    set("contactName", nameRef.current?.value.trim() ?? "");
    set("contactPhone", phoneRef.current?.value.trim() ?? "");
    set("contactEmail", email);
    setPendingEmail(email);
    startVerification(email);
  }

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleVerify() {
    if (!token) return;
    setSubmitting(true);
    const check = await checkVerificationEmail(token, pendingEmail, emailCodeInput);
    if (!check.ok) {
      setSubmitting(false);
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setSubmitError(null);
    let result: Awaited<ReturnType<typeof submitCaseToDatabase>>;
    try {
      result = await submitCaseToDatabase(state);
    } catch (err) {
      setSubmitting(false);
      setSubmitError("קרתה תקלה לא צפויה. נסו שוב: " + (err instanceof Error ? err.message : String(err)));
      return;
    }
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError("לא הצלחנו לשמור את התיק. נסו שוב בעוד רגע — אם זה חוזר, ספרו לנו: " + result.error);
      return;
    }
    dispatch({ type: "VERIFIED" });
  }

  if (!showVerify) {
    return (
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-form__row">
          <label className="contact-field">
            <span>שם מלא</span>
            <input type="text" ref={nameRef} autoComplete="name" defaultValue={state.contactName} required />
          </label>
          <label className="contact-field">
            <span>טלפון</span>
            <input type="tel" ref={phoneRef} autoComplete="tel" dir="ltr" placeholder="050-0000000" defaultValue={state.contactPhone} required />
          </label>
        </div>
        <div className="contact-form__row">
          <label className="contact-field">
            <span>מייל (לשם יישלח קוד)</span>
            <input type="email" ref={emailRef} autoComplete="email" dir="ltr" defaultValue={state.contactEmail} required />
          </label>
          <div className="contact-field">
            <span>מתי נוח שנחזור אליכם?</span>
            <ChipRow
              value={state.contactTime}
              onSelect={(v) => set("contactTime", v)}
              options={[
                { value: "morning", label: "בוקר" },
                { value: "noon", label: "צהריים" },
                { value: "evening", label: "ערב" },
              ]}
            />
          </div>
        </div>
        {sendError && (
          <div className="match-note warn" role="alert">
            <svg><use href="#ic-alert" /></svg>{sendError}
          </div>
        )}
        <button type="submit" className="btn btn-primary contact-form__submit" disabled={sendingCode}>
          {sendingCode ? "שולח קוד אימות…" : "המשך לאימות זהות"}
        </button>
      </form>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="verify-note">
        <svg><use href="#ic-lock" /></svg> לפני שהתיק ננעל ויוצא ליועצים, שלחנו קוד אימות בן 4 ספרות לכתובת <b>{pendingEmail}</b>.
      </div>
      <div className="field">
        <label>קוד מהמייל</label>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="0000"
            value={emailCodeInput}
            onChange={(e) => setEmailCodeInput(e.target.value)}
            className="code-input" aria-label="קוד בן 4 ספרות"
          />
          <button type="button" className="btn-link" onClick={() => startVerification(pendingEmail)} disabled={sendingCode}>
            {sendingCode ? "שולח…" : justResent ? "קוד חדש נשלח" : "שליחה חוזרת"}
          </button>
        </div>
        {emailError && <small className="hint" style={{ color: "var(--risk)" }}>קוד שגוי — נסו שוב.</small>}
      </div>
      {submitError && (
        <div className="match-note warn">
          <svg><use href="#ic-alert" /></svg>{submitError}
        </div>
      )}
      <button type="button" className="btn btn-primary contact-form__submit" onClick={handleVerify} disabled={submitting}>
        {submitting ? "נועל את התיק…" : "אימות ונעילת התיק"}
      </button>
      <button type="button" className="btn-link" style={{ alignSelf: "center" }} onClick={() => setShowVerify(false)}>
        חזרה לעריכת הפרטים
      </button>
    </div>
  );
}

function DonePanel() {
  return (
    <section className="stage">
      <div className="done-panel">
                <div className="done-bear-wrap">
          <RiggedBear mood="wave" />
        </div>
        <span className="done-stamp" aria-hidden>נשלח<small>ע״י ארתור</small></span>
        <h2>סיימנו! נהיה בקשר</h2>
        <p>
          תודה! אימתתי את הזהות שלכם, ונעלתי את התיק אצלי. עכשיו אני בוחר לכם את היועצים הכי מתאימים, ומהרגע שתתקבל הצעה משתלמת — אני מתקשר בטווח השעות שבחרתם.
        </p>
        <button
          type="button"
          className="btn-link"
          onClick={() => location.reload()}
        >
          התחלת תהליך חדש
        </button>
      </div>
    </section>
  );
}
