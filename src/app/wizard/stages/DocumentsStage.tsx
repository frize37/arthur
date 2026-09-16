"use client";

import { useState } from "react";
import type { StageProps } from "../lib/reducer";
import { NavRow } from "../components/ui";
import { RiggedBear, type RigMood } from "../components/RiggedBear";
import { shekel } from "../lib/finance";
import { confettiBurst } from "../lib/effects";
import type { LoanTrack } from "../lib/types";

type Phase = "idle" | "parsing" | "error";
type Mode = "upload" | "manual";

const IDLE_BUBBLE = "העלו דוח יתרות או אישור עקרוני — אני אשלוף מתוכו את המספרים החשובים לבד, ואתם רק תאשרו.";
const PARSED_BUBBLE = "איזה כיף! מצאתי את כל הנתונים במסמך 🎉 אפשר לבדוק ולתקן אם צריך.";
const MANUAL_BUBBLE =
  "אין לכם את הדוח? לא נורא, תמלאו את הפרטים בעצמכם. רק שימו לב: אם יתברר שיש אי-דיוקים, היועץ יכול לבטל את ההצעה שהוגשה על בסיסם — אז כדאי שיהיו מדויקים ככל שאפשר.";
const MANUAL_CONFIRMED_BUBBLE = "קיבלתי את הפרטים 👍 שווה לוודא שהם מדויקים, כי לפיהם היועצים יגישו הצעה — ואי-דיוקים עלולים לבטל אותה.";

const ANCHOR_OPTIONS = ["אג\"ח ממשלתי", "פריים", "דולר"];

const emptyManualTrack: LoanTrack = {
  bankName: null,
  rateKind: null,
  anchorBasis: null,
  linkedToCpi: false,
  repaymentMethod: null,
  annualRate: null,
  anchorRate: null,
  marginRate: null,
  nextRateChangeDate: null,
  monthsRemaining: null,
  principalBalance: null,
  accruedInterest: null,
  arrearsBalance: null,
  arrearsInterest: null,
  payoffBalance: null,
  earlyRepaymentFee: null,
  comparisonRate: null,
  forecastRate: null,
};

export function DocumentsStage({ state, set, dispatch, go, back }: StageProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<Mode>(state.docSource === "manual" ? "manual" : "upload");
  const [fileName, setFileName] = useState("מסמך שהועלה");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mood, setMood] = useState<RigMood>("idle");
  const [bubble, setBubble] = useState(
    state.docSource === "manual" ? MANUAL_CONFIRMED_BUBBLE : state.docConfirmed ? PARSED_BUBBLE : IDLE_BUBBLE
  );
  const [manualTracks, setManualTracks] = useState<LoanTrack[]>(
    state.docSource === "manual" && state.docTracks.length > 0 ? state.docTracks : [emptyManualTrack]
  );

  function updateManualTrack(index: number, patch: Partial<LoanTrack>) {
    setManualTracks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }
  function addManualTrack() {
    setManualTracks((prev) => [...prev, emptyManualTrack]);
  }
  function removeManualTrack(index: number) {
    setManualTracks((prev) => prev.filter((_, i) => i !== index));
  }

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
      form.append("caseId", state.caseId);
      const res = await fetch("/api/parse-mortgage-document", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) {
        setPhase("error");
        setErrorMsg((json.error ?? "קריאת המסמך נכשלה.") + (json.detail ? ` — ${json.detail}` : ""));
        setMood("sad");
        return;
      }
      set("originalDocName", file.name);
      set("originalDocType", file.type);
      const result = json.result;
      dispatch({
        type: "DOC_PARSED",
        source: "ai",
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

  function switchToManual() {
    setMode("manual");
    setBubble(MANUAL_BUBBLE);
  }

  const manualValid = manualTracks.every(
    (t) => t.rateKind != null && (t.principalBalance ?? 0) > 0 && (t.annualRate ?? 0) > 0
  );

  function confirmManual() {
    if (!manualValid) return;
    const totalPrincipal = manualTracks.reduce((sum, t) => sum + (t.principalBalance ?? 0), 0);
    const feeTracks = manualTracks.filter((t) => t.earlyRepaymentFee != null);
    const totalEarlyRepaymentFee = feeTracks.length > 0 ? feeTracks.reduce((sum, t) => sum + (t.earlyRepaymentFee ?? 0), 0) : null;
    dispatch({
      type: "DOC_PARSED",
      source: "manual",
      tracks: manualTracks,
      totals: {
        quoteValidDate: null,
        totalPrincipal,
        totalEarlyRepaymentFee,
        totalPayoff: null,
        accountComparisonRate: null,
        accountForecastRate: null,
      },
    });
    setMood("clap");
    setBubble(MANUAL_CONFIRMED_BUBBLE);
    confettiBurst();
    setTimeout(() => setMood("idle"), 1550);
  }

  return (
    <section className="stage">
      <div className="buddy-row buddy-row--doc">
        <RiggedBear mood={mood} />
        <div className="bubble">{bubble}</div>
      </div>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card-badge">🤖 קריאה אוטומטית חכמה</div>
        {mode === "upload" && !state.docConfirmed && (
          <div className="anon-note">תעלו את דוח היתרות שלכם — כך נוכל לדייק את ההצעה שתקבלו.</div>
        )}
        {mode === "upload" && (
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
          {state.docConfirmed && state.docSource === "ai" && <div className="filechip">📎 {fileName}</div>}
        </div>
        )}
        {mode === "upload" && !state.docConfirmed && phase === "idle" && (
          <button type="button" className="btn-link" style={{ alignSelf: "center", fontSize: 12 }} onClick={switchToManual}>
            אין לי את הדוח איתי
          </button>
        )}

        {mode === "manual" && !state.docConfirmed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button type="button" className="btn-link" style={{ alignSelf: "center", fontSize: 12 }} onClick={() => setMode("upload")}>
              בעצם יש לי את הדוח, אעלה אותו
            </button>
            {state.mortgageAmount > 0 && (
              <div className="anon-note">גובה המשכנתה שציינתם קודם: <b className="num">{shekel(state.mortgageAmount)}</b> — פרטו כאן את המסלולים שמרכיבים אותה.</div>
            )}
            {manualTracks.map((t, i) => (
              <div className="card" key={i} style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <strong>מסלול {String.fromCharCode(0x5d0 + i)}׳</strong>
                  {manualTracks.length > 1 && (
                    <button type="button" className="btn-link" onClick={() => removeManualTrack(i)}>
                      הסרה
                    </button>
                  )}
                </div>
                <div className="parsed-grid">
                  <div className="parsed-field">
                    <label>שם הבנק</label>
                    <input type="text" value={t.bankName ?? ""} onChange={(e) => updateManualTrack(i, { bankName: e.target.value })} />
                  </div>
                  <div className="parsed-field">
                    <label>סוג ריבית *</label>
                    <select
                      value={t.rateKind ?? ""}
                      onChange={(e) => updateManualTrack(i, { rateKind: (e.target.value || null) as LoanTrack["rateKind"] })}
                    >
                      <option value="">בחרו</option>
                      <option value="fixed">קבועה</option>
                      <option value="variable">משתנה</option>
                    </select>
                  </div>
                  {t.rateKind === "variable" && (
                    <>
                      <div className="parsed-field">
                        <label>בסיס הריבית</label>
                        <select value={t.anchorBasis ?? ""} onChange={(e) => updateManualTrack(i, { anchorBasis: e.target.value || null })}>
                          <option value="">בחרו</option>
                          {ANCHOR_OPTIONS.map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                      <div className="parsed-field">
                        <label>מתי מתעדכנת הריבית / נקודת היציאה?</label>
                        <input
                          type="date"
                          value={t.nextRateChangeDate ?? ""}
                          onChange={(e) => updateManualTrack(i, { nextRateChangeDate: e.target.value || null })}
                        />
                      </div>
                    </>
                  )}
                  <div className="parsed-field">
                    <label>צמודה למדד?</label>
                    <select
                      value={t.linkedToCpi ? "yes" : "no"}
                      onChange={(e) => updateManualTrack(i, { linkedToCpi: e.target.value === "yes" })}
                    >
                      <option value="no">לא</option>
                      <option value="yes">כן</option>
                    </select>
                  </div>
                  <div className="parsed-field">
                    <label>ריבית שנתית % *</label>
                    <input
                      type="number"
                      step={0.01}
                      value={t.annualRate ?? ""}
                      onChange={(e) => updateManualTrack(i, { annualRate: Number(e.target.value) || null })}
                    />
                  </div>
                  <div className="parsed-field">
                    <label>יתרת תקופה (חודשים)</label>
                    <input
                      type="number"
                      value={t.monthsRemaining ?? ""}
                      onChange={(e) => updateManualTrack(i, { monthsRemaining: Number(e.target.value) || null })}
                    />
                  </div>
                  <div className="parsed-field">
                    <label>יתרת קרן *</label>
                    <input
                      type="number"
                      value={t.principalBalance ?? ""}
                      onChange={(e) => updateManualTrack(i, { principalBalance: Number(e.target.value) || null })}
                    />
                  </div>
                  <div className="parsed-field">
                    <label>עמלת פרעון מוקדם</label>
                    <input
                      type="number"
                      value={t.earlyRepaymentFee ?? ""}
                      onChange={(e) => updateManualTrack(i, { earlyRepaymentFee: Number(e.target.value) || null })}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addManualTrack}>
              + הוספת מסלול נוסף
            </button>
            <div className="tracks-note">שדות עם * הם חובה. ההצעה שתתקבל תהיה מבוססת על מה שתצהירו כאן — אי-דיוקים עלולים לגרום לביטול ההצעה.</div>
            <button type="button" className="btn btn-primary" disabled={!manualValid} onClick={confirmManual}>
              אישור הפרטים
            </button>
          </div>
        )}

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

        {state.docConfirmed && state.docSource === "manual" && (
          <button
            type="button"
            className="btn-link"
            style={{ alignSelf: "center" }}
            onClick={() => set("docConfirmed", false)}
          >
            למלא מחדש את הפרטים
          </button>
        )}
      </div>
      <NavRow onBack={back} onNext={() => go("summary")} nextDisabled={!state.docConfirmed} />
    </section>
  );
}
