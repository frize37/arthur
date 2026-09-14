"use client";

import { useState } from "react";
import type { StageProps } from "../lib/reducer";
import { NavRow } from "../components/ui";
import { RiggedBear, type RigMood } from "../components/RiggedBear";
import { computeSuggestedSavings, shekel } from "../lib/finance";
import { confettiBurst } from "../lib/effects";

type Phase = "idle" | "parsing" | "error";

const IDLE_BUBBLE = "העלו דוח יתרות או אישור עקרוני — אני אשלוף מתוכו את המספרים החשובים לבד, ואתם רק תאשרו.";
const PARSED_BUBBLE = "איזה כיף! מצאתי את כל הנתונים במסמך 🎉 אפשר לבדוק ולתקן אם צריך.";
const SKIPPED_BUBBLE = "אה, אין מסמך כרגע... 🥲 לא נורא, נמשיך עם הערכה כללית וניתן ליועץ להשלים את התמונה.";

export function DocumentsStage({ state, set, dispatch, go, back }: StageProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState("מסמך שהועלה");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mood, setMood] = useState<RigMood>(state.docSkipped ? "sad" : "idle");
  const [bubble, setBubble] = useState(state.docSkipped ? SKIPPED_BUBBLE : state.docConfirmed ? PARSED_BUBBLE : IDLE_BUBBLE);
  const [skipLabel, setSkipLabel] = useState(state.docSkipped ? "דילגתם על שלב זה — אפשר להמשיך" : "דלגו כרגע, אין לי מסמך זמין");

  const totalMonths = state.docYears * 12 + state.docMonths;
  const currentSavings = computeSuggestedSavings(state.docBalance, state.docRate, totalMonths);
  const savingsFillPct = Math.min(100, (currentSavings / 70000) * 100);
  const matchDiffPct = state.mortgageAmount ? Math.abs(state.docBalance - state.mortgageAmount) / state.mortgageAmount : 0;

  async function handleFile(file: File) {
    setFileName(file.name);
    setPhase("parsing");
    setErrorMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-mortgage-document", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) {
        setPhase("error");
        setErrorMsg(json.error ?? "קריאת המסמך נכשלה.");
        setMood("sad");
        return;
      }
      const result = json.result;
      dispatch({
        type: "DOC_PARSED",
        tracks: result.tracks ?? [],
        totals: {
          quoteValidDate: result.quoteValidDate ?? null,
          totalPrincipal: result.totalPrincipal ?? null,
          totalEarlyRepaymentFee: result.totalEarlyRepaymentFee ?? null,
          totalPayoff: result.totalPayoff ?? null,
          accountComparisonRate: result.accountComparisonRate ?? null,
          accountForecastRate: result.accountForecastRate ?? null,
        },
      });
      setPhase("idle");
      setMood("clap");
      setBubble(PARSED_BUBBLE);
      confettiBurst();
      setTimeout(() => setMood("idle"), 1550);
    } catch (err) {
      setPhase("error");
      setErrorMsg("קרתה תקלה בתקשורת. נסו שוב: " + (err instanceof Error ? err.message : String(err)));
      setMood("sad");
    }
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
          {phase === "error" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <div className="match-note warn">
                <svg><use href="#ic-alert" /></svg>{errorMsg}
              </div>
              <label className="btn btn-primary" style={{ display: "inline-block" }}>
                נסו להעלות שוב
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
              {state.docTracks.length > 0 ? (
                <div className="tracks-note">
                  זיהינו {state.docTracks.length} מסלולים במסמך — הפרטים המלאים (כולל עמלת פרעון מוקדם לכל מסלול) יועברו ליועץ. השדות שלמעלה הם הערכה כוללת שאפשר לתקן כאן.
                </div>
              ) : (
                <div className="tracks-note">אפשר לתקן כל שדה לפני שממשיכים.</div>
              )}
            </div>

            {state.docTracks.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {state.docTracks.map((t, i) => (
                  <div className="card" key={i} style={{ padding: 14 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>
                      מסלול {String.fromCharCode(0x5d0 + i)}׳{t.bankName ? ` · ${t.bankName}` : ""}
                    </div>
                    <div className="brief-grid">
                      <div className="brief-item">
                        <span>סוג ריבית</span>
                        <b>
                          {t.rateKind === "fixed" ? "קבועה" : t.rateKind === "variable" ? "משתנה" : "לא ידוע"}
                          {t.linkedToCpi ? " · צמודה למדד" : ""}
                        </b>
                      </div>
                      {t.annualRate != null && (
                        <div className="brief-item">
                          <span>ריבית שנתית</span>
                          <b>{t.annualRate}%</b>
                        </div>
                      )}
                      {t.monthsRemaining != null && (
                        <div className="brief-item">
                          <span>יתרת תקופה</span>
                          <b>{t.monthsRemaining} חודשים</b>
                        </div>
                      )}
                      {t.principalBalance != null && (
                        <div className="brief-item">
                          <span>יתרת קרן</span>
                          <b>{shekel(t.principalBalance)}</b>
                        </div>
                      )}
                      {t.earlyRepaymentFee != null && (
                        <div className="brief-item">
                          <span>עמלת פרעון מוקדם</span>
                          <b>{shekel(t.earlyRepaymentFee)}</b>
                        </div>
                      )}
                      {(t.arrearsBalance ?? 0) > 0 && (
                        <div className="brief-item">
                          <span>יתרת פיגור</span>
                          <b style={{ color: "var(--risk)" }}>{shekel(t.arrearsBalance ?? 0)}</b>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {state.docTotalEarlyRepaymentFee != null && (
                  <div className="match-note ok">
                    <svg><use href="#ic-check-circle" /></svg>סה״כ עמלת פרעון מוקדם לכל המשכנתה: {shekel(state.docTotalEarlyRepaymentFee)}
                  </div>
                )}
              </div>
            )}

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
