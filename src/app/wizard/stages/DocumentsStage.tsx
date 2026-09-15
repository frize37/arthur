"use client";

import { useState } from "react";
import type { StageProps } from "../lib/reducer";
import { NavRow } from "../components/ui";
import { RiggedBear, type RigMood } from "../components/RiggedBear";
import { shekel } from "../lib/finance";
import { confettiBurst } from "../lib/effects";
import type { LoanTrack } from "../lib/types";

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

  const matchDiffPct = state.mortgageAmount ? Math.abs(state.docBalance - state.mortgageAmount) / state.mortgageAmount : 0;

  function updateTrack(index: number, patch: Partial<LoanTrack>) {
    const next = state.docTracks.map((t, i) => (i === index ? { ...t, ...patch } : t));
    set("docTracks", next);
  }

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
        setErrorMsg((json.error ?? "קריאת המסמך נכשלה.") + (json.detail ? ` — ${json.detail}` : ""));
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
                <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>
                  אם ה-AI טעה במשהו, אפשר לתקן כל שדה ישירות כאן.
                </div>
                {state.docTracks.map((t, i) => (
                  <div className="card" key={i} style={{ padding: 14 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>מסלול {String.fromCharCode(0x5d0 + i)}׳</div>
                    <div className="parsed-grid">
                      <div className="parsed-field">
                        <label>שם הבנק</label>
                        <input type="text" value={t.bankName ?? ""} onChange={(e) => updateTrack(i, { bankName: e.target.value })} />
                      </div>
                      <div className="parsed-field">
                        <label>סוג ריבית</label>
                        <select
                          value={t.rateKind ?? ""}
                          onChange={(e) => updateTrack(i, { rateKind: (e.target.value || null) as LoanTrack["rateKind"] })}
                        >
                          <option value="">לא ידוע</option>
                          <option value="fixed">קבועה</option>
                          <option value="variable">משתנה</option>
                        </select>
                      </div>
                      {t.rateKind === "variable" && (
                        <div className="parsed-field">
                          <label>בסיס הריבית (למשל פריים)</label>
                          <input
                            type="text"
                            value={t.anchorBasis ?? ""}
                            onChange={(e) => updateTrack(i, { anchorBasis: e.target.value })}
                          />
                        </div>
                      )}
                      <div className="parsed-field">
                        <label>צמודה למדד?</label>
                        <select
                          value={t.linkedToCpi ? "yes" : "no"}
                          onChange={(e) => updateTrack(i, { linkedToCpi: e.target.value === "yes" })}
                        >
                          <option value="no">לא</option>
                          <option value="yes">כן</option>
                        </select>
                      </div>
                      <div className="parsed-field">
                        <label>ריבית שנתית %</label>
                        <input
                          type="number"
                          step={0.01}
                          value={t.annualRate ?? 0}
                          onChange={(e) => updateTrack(i, { annualRate: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="parsed-field">
                        <label>יתרת תקופה (חודשים)</label>
                        <input
                          type="number"
                          value={t.monthsRemaining ?? 0}
                          onChange={(e) => updateTrack(i, { monthsRemaining: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="parsed-field">
                        <label>יתרת קרן</label>
                        <input
                          type="number"
                          value={t.principalBalance ?? 0}
                          onChange={(e) => updateTrack(i, { principalBalance: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="parsed-field">
                        <label>עמלת פרעון מוקדם</label>
                        <input
                          type="number"
                          value={t.earlyRepaymentFee ?? 0}
                          onChange={(e) => updateTrack(i, { earlyRepaymentFee: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="parsed-field">
                        <label>ריבית לצרכי השוואה %</label>
                        <input
                          type="number"
                          step={0.01}
                          value={t.comparisonRate ?? 0}
                          onChange={(e) => updateTrack(i, { comparisonRate: Number(e.target.value) || 0 })}
                        />
                      </div>
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
                <svg><use href="#ic-cash" /></svg>מה אני עושה עכשיו?
              </div>
              <p>אני בודק את הנתונים שלכם, משווה בין יועצי המשכנתאות המתאימים ומחפש את ההצעה שהכי מתאימה לתיק שלכם.</p>
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
