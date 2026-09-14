"use client";

import { useState } from "react";
import type { StageProps } from "../lib/reducer";
import { NavRow } from "../components/ui";
import { RiggedBear, type RigMood } from "../components/RiggedBear";
import { computeSuggestedSavings, shekel } from "../lib/finance";
import { confettiBurst } from "../lib/effects";

type Phase = "idle" | "parsing";

const IDLE_BUBBLE = "העלו דוח יתרות או אישור עקרוני — אני אשלוף מתוכו את המספרים החשובים לבד, ואתם רק תאשרו.";
const PARSED_BUBBLE = "איזה כיף! מצאתי את כל הנתונים במסמך 🎉 אפשר לבדוק ולתקן אם צריך.";
const SKIPPED_BUBBLE = "אה, אין מסמך כרגע... 🥲 לא נורא, נמשיך עם הערכה כללית וניתן ליועץ להשלים את התמונה.";

export function DocumentsStage({ state, set, dispatch, go, back }: StageProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState("מסמך שהועלה");
  const [mood, setMood] = useState<RigMood>(state.docSkipped ? "sad" : "idle");
  const [bubble, setBubble] = useState(state.docSkipped ? SKIPPED_BUBBLE : state.docConfirmed ? PARSED_BUBBLE : IDLE_BUBBLE);
  const [skipLabel, setSkipLabel] = useState(state.docSkipped ? "דילגתם על שלב זה — אפשר להמשיך" : "דלגו כרגע, אין לי מסמך זמין");

  const totalMonths = state.docYears * 12 + state.docMonths;
  const currentSavings = computeSuggestedSavings(state.docBalance, state.docRate, totalMonths);
  const savingsFillPct = Math.min(100, (currentSavings / 70000) * 100);
  const matchDiffPct = state.mortgageAmount ? Math.abs(state.docBalance - state.mortgageAmount) / state.mortgageAmount : 0;

  function handleFile(file: File) {
    setFileName(file.name);
    setPhase("parsing");
    setTimeout(() => {
      let balance = state.docBalance;
      if (!state.docParsedOnce) {
        const variance = 0.9 + Math.random() * 0.2;
        balance = Math.round((state.mortgageAmount * variance) / 1000) * 1000;
      }
      dispatch({ type: "DOC_PARSED", balance });
      setPhase("idle");
      setMood("clap");
      setBubble(PARSED_BUBBLE);
      confettiBurst();
      setTimeout(() => setMood("idle"), 1550);
    }, 1300);
  }

  function handleSkip() {
    dispatch({ type: "DOC_SKIPPED" });
    setSkipLabel("דילגתם על שלב זה — אפשר להמשיך");
    setMood("sad");
    setBubble(SKIPPED_BUBBLE);
  }

  return (
    <section className="stage">
      <div className="buddy-row buddy-row--doc">
        <RiggedBear mood={mood} />
        <div className="bubble">{bubble}</div>
      </div>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card-badge">🤖 קריאה אוטומטית חכמה</div>
        <div className="dropzone">
          <svg><use href="#ic-upload" /></svg>
          {!state.docConfirmed && phase === "idle" && (
            <div>
              <label className="btn btn-primary" style={{ display: "inline-block" }}>
                בחרו קובץ להעלאה
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
              <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 8 }}>PDF או צילום מסך של דוח יתרות</div>
            </div>
          )}
          {phase === "parsing" && (
            <div className="parsing">
              <span className="spinner" /> ארתור קורא את המסמך…
            </div>
          )}
          {state.docConfirmed && phase === "idle" && <div className="filechip">📎 {fileName}</div>}
        </div>

        {state.docConfirmed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="parsed-grid">
              <div className="parsed-field">
                <label>יתרת קרן</label>
                <input type="number" value={state.docBalance} onChange={(e) => set("docBalance", Number(e.target.value) || 0)} />
              </div>
              <div className="parsed-field">
                <label>ריבית שנתית ממוצעת %</label>
                <input type="number" step={0.01} value={state.docRate} onChange={(e) => set("docRate", Number(e.target.value) || 0)} />
              </div>
              <div className="parsed-field">
                <label>תקופה שנותרה (שנים)</label>
                <input type="number" value={state.docYears} onChange={(e) => set("docYears", Number(e.target.value) || 0)} />
              </div>
              <div className="parsed-field">
                <label>תקופה שנותרה (חודשים)</label>
                <input type="number" value={state.docMonths} onChange={(e) => set("docMonths", Number(e.target.value) || 0)} />
              </div>
              <div className="tracks-note">3 מסלולים: קבועה לא-צמודה 40% · פריים 35% · משתנה כל 5 שנים 25%. אפשר לתקן כל שדה לפני שממשיכים.</div>
            </div>

            {state.mortgageAmount > 0 &&
              (matchDiffPct <= 0.06 ? (
                <div className="match-note ok">
                  <svg><use href="#ic-check-circle" /></svg>המספר תואם למה שסיפרתם לנו בשלב הנתונים.
                </div>
              ) : (
                <div className="match-note warn">
                  <svg><use href="#ic-alert" /></svg>שימו לב: יש פער מול מה שסיפרתם קודם ({shekel(state.mortgageAmount)}) — נעדכן את היועץ שיבדוק את זה מולכם.
                </div>
              ))}

            <div className="savings-meter">
              <div className="savings-meter__head">
                <svg><use href="#ic-cash" /></svg>מד החיסכון המשוער
              </div>
              <p>
                לפי הנתונים הראשוניים שלכם, אנחנו מזהים פוטנציאל חיסכון של כ-<b className="num">{shekel(currentSavings)}</b> לאורך חיי ההלוואה! 🎉
              </p>
              <div className="meter-bar">
                <div className="meter-bar__fill" style={{ width: `${savingsFillPct}%` }} />
              </div>
            </div>
          </div>
        )}

        <button type="button" className="btn-link" style={{ alignSelf: "center" }} onClick={handleSkip}>
          {skipLabel}
        </button>
      </div>
      <NavRow onBack={back} onNext={() => go("summary")} nextDisabled={!(state.docConfirmed || state.docSkipped)} />
    </section>
  );
}
