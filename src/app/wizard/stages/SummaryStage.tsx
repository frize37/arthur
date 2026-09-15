"use client";

import { useEffect, useRef, useState } from "react";
import type { StageProps } from "../lib/reducer";
import { GOAL_LABELS, isComplexCase } from "../lib/types";
import { bandFor, monthlyPayment, shekel } from "../lib/finance";
import { confettiBurst } from "../lib/effects";
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
      confettiBurst();
      dispatch({ type: "CELEBRATE_SUMMARY" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [band]);

  if (state.submitted) {
    return <DonePanel />;
  }

  return (
    <section className="stage">
      <BuddyRow mood={summaryMood} bubble={summaryBubble} />

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="card-badge">📊 בזמן אמת</div>
        <div className="gauge-wrap" style={{ ["--glow" as string]: `var(--${band})` }}>
          <div className="gauge">
            <div className="gauge__arc" />
            <div className="gauge__hole" />
            <div className="gauge__needle" style={{ transform: `rotate(${needleDeg}deg)` }} />
            <div className="gauge__hub" />
          </div>
          <div className="gauge-ticks"><span>0%</span><span>35%</span><span>40%</span><span>60%+</span></div>
          <div className="ratio-big">
            יחס החזר מהכנסה<b className="num">{(ratio * 100).toFixed(0)}%</b>
          </div>
          <div className={`band-chip band-${band}`} style={{ alignSelf: "center" }}>{bandLabel}</div>
        </div>
        <div className="statrow">
          <div className="stat"><span>החזר חודשי משוער</span><b className="num">{shekel(payment)}</b></div>
          <div className="stat"><span>הכנסה פנויה כוללת</span><b className="num">{shekel(totalIncome)}</b></div>
        </div>
        <div className="statrow">
          <div className="stat"><span>ההחזר הנוח שהגדרתם</span><b className="num">{shekel(state.comfortPayment)}</b></div>
          <div className="stat"><span>הסף המקסימלי שהגדרתם</span><b className="num">{shekel(state.maxStressPayment)}</b></div>
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 style={{ fontSize: 16 }}>התיק שלכם יוצא ליועצי המשכנתאות המתאימים לו</h3>
        <div className="sendflow">
          <svg style={{ width: 26, height: 26, color: "var(--teal)" }}><use href="#ic-layers" /></svg>
          <svg className="sendflow__arrow" viewBox="0 0 24 24" style={{ width: 18, height: 18, transform: "scaleX(-1)" }}>
            <path d="M5 12h14m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="sendflow__dot" /><div className="sendflow__dot" /><div className="sendflow__dot" />
        </div>
        <div className="specialty-grid">
          <div className="specialty"><svg><use href="#ic-down" /></svg><span>מיחזור וריביות</span></div>
          <div className="specialty"><svg><use href="#ic-clock" /></svg><span>מסלולים משתנים</span></div>
          <div className="specialty"><svg><use href="#ic-search" /></svg><span>עצמאים ותיקים מורכבים</span></div>
          <div className="specialty"><svg><use href="#ic-merge" /></svg><span>איחוד הלוואות</span></div>
        </div>
        <div className="anon-note">
          הנתונים נשלחים ליועצים <b>ללא שם או פרטים מזהים</b>. כל יועץ מגיש הצעת מחיר, ואנחנו מעבירים אליכם רק את <b>ההצעה המשתלמת ביותר</b>.
        </div>

        <ContactAndVerify state={state} set={set} dispatch={dispatch} />
      </div>

      <div className="navrow">
        <button type="button" className="btn btn-ghost" onClick={back}>חזרה</button>
        <span className="spacer" />
        <button
          type="button"
          className="btn-link"
          onClick={() => dispatch({ type: "RESET" })}
        >
          התחלת תהליך מחדש
        </button>
      </div>
    </section>
  );
}

function genCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
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
  const [codes, setCodes] = useState({ phone: "", email: "" });
  const [phoneCodeInput, setPhoneCodeInput] = useState("");
  const [emailCodeInput, setEmailCodeInput] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  function startVerification() {
    setCodes({ phone: genCode(), email: genCode() });
    setPhoneCodeInput("");
    setEmailCodeInput("");
    setPhoneError(false);
    setEmailError(false);
    setShowVerify(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    set("contactName", nameRef.current?.value.trim() ?? "");
    set("contactPhone", phoneRef.current?.value.trim() ?? "");
    set("contactEmail", emailRef.current?.value.trim() ?? "");
    startVerification();
  }

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleVerify() {
    const okPhone = phoneCodeInput === codes.phone;
    const okEmail = emailCodeInput === codes.email;
    setPhoneError(!okPhone);
    setEmailError(!okEmail);
    if (okPhone && okEmail) {
      setSubmitting(true);
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
  }

  if (!showVerify) {
    return (
      <div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>השאירו פרטים כדי שנדע לאן להעביר את ההצעה הזוכה</label>
          <input type="text" ref={nameRef} placeholder="שם מלא" defaultValue={state.contactName} required />
          <input type="tel" ref={phoneRef} placeholder="050-0000000" defaultValue={state.contactPhone} required />
          <input type="email" ref={emailRef} placeholder="כתובת מייל" defaultValue={state.contactEmail} required />
          <ChipRow
            value={state.contactTime}
            onSelect={(v) => set("contactTime", v)}
            options={[
              { value: "morning", label: "בוקר" },
              { value: "noon", label: "צהריים" },
              { value: "evening", label: "ערב" },
            ]}
          />
          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: 14 }}>
            המשך לאימות זהות
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="bubble" style={{ background: "var(--surface-2)" }}>
        <svg style={{ width: 15, height: 15, verticalAlign: -2, color: "var(--teal)" }}><use href="#ic-lock" /></svg> לפני שהתיק ננעל ויוצא ליועצים, שלחנו קוד אימות בן 4 ספרות ל-<b>{state.contactPhone}</b> ולכתובת <b>{state.contactEmail}</b>.
      </div>
      <div className="field">
        <label>קוד מהטלפון (SMS)</label>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="0000"
            value={phoneCodeInput}
            onChange={(e) => setPhoneCodeInput(e.target.value)}
            style={{ width: 96, textAlign: "center", fontFamily: "var(--font-rubik)", fontSize: 19, letterSpacing: 5, border: "1.5px solid var(--line)", borderRadius: 10, padding: 9, background: "var(--surface)", color: "var(--ink)" }}
          />
          <button type="button" className="btn-link" onClick={() => setCodes((c) => ({ ...c, phone: genCode() }))}>שליחה חוזרת</button>
        </div>
        {phoneError && <small className="hint" style={{ color: "var(--risk)" }}>קוד שגוי — נסו שוב.</small>}
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
            style={{ width: 96, textAlign: "center", fontFamily: "var(--font-rubik)", fontSize: 19, letterSpacing: 5, border: "1.5px solid var(--line)", borderRadius: 10, padding: 9, background: "var(--surface)", color: "var(--ink)" }}
          />
          <button type="button" className="btn-link" onClick={() => setCodes((c) => ({ ...c, email: genCode() }))}>שליחה חוזרת</button>
        </div>
        {emailError && <small className="hint" style={{ color: "var(--risk)" }}>קוד שגוי — נסו שוב.</small>}
      </div>
      <div className="savings-mini" style={{ alignSelf: "stretch" }}>
        🧪 לצורך ההדגמה בלבד (עדיין אין חיבור אמיתי ל-SMS/מייל): קוד הטלפון <b className="num">{codes.phone}</b>, קוד המייל <b className="num">{codes.email}</b>.
      </div>
      {submitError && (
        <div className="match-note warn">
          <svg><use href="#ic-alert" /></svg>{submitError}
        </div>
      )}
      <button type="button" className="btn btn-primary" style={{ width: "100%", padding: 14 }} onClick={handleVerify} disabled={submitting}>
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
        <div className="done-panel__glow" />
        <div className="done-bear-wrap">
          <RiggedBear mood="wave" />
        </div>
        <span className="kicker-onhero">✓ נשלח בהצלחה</span>
        <h2>סיימנו! נהיה בקשר 👋</h2>
        <p>
          תודה! אימתתי את הזהות שלכם, ונעלתי את התיק (בעילום שם) אצלי. עכשיו אני בוחר לכם את היועצים הכי מתאימים, ומהרגע שתתקבל הצעה משתלמת — אני מתקשר בטווח השעות שבחרתם.
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
