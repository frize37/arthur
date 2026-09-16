"use client";

import { useEffect, useMemo, useState } from "react";
import "./advisor.css";
import { AdvisorIcons } from "./components/AdvisorIcons";
import { ArthurMascot } from "@/components/ArthurMascot";
import { AdvisorCase, LABELS, STATUS_META, computeCase, computeCommission, deriveKeyPoints } from "./lib/data";
import { fetchMyCases, fetchMyCommission, getCleanDocUrl, submitCompletion, submitOffer } from "./lib/fetchCases";
import { shekel } from "../wizard/lib/finance";
import { confettiBurst } from "../wizard/lib/effects";
import { SignOutButton } from "@/components/SignOutButton";
import { CaseChat } from "@/components/CaseChat";

function briefRow(label: string, value: string) {
  return (
    <div className="brief-item" key={label}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export function AdvisorApp({ advisorId, advisorName }: { advisorId: string; advisorName: string }) {
  const [cases, setCases] = useState<AdvisorCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [bellSeen, setBellSeen] = useState(false);
  const [commission, setCommission] = useState<{ commissionType: "percent" | "fixed" | null; commissionValue: number | null; logoUrl: string | null }>({
    commissionType: null,
    commissionValue: null,
    logoUrl: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [list, myCommission] = await Promise.all([fetchMyCases(advisorId), fetchMyCommission(advisorId)]);
      if (cancelled) return;
      setCases(list);
      setCommission(myCommission);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [advisorId]);

  const stats = useMemo(() => {
    const open = cases.filter((c) => c.status === "pending" || c.status === "sent").length;
    const pending = cases.filter((c) => c.status === "pending").length;
    const sent = cases.filter((c) => c.status !== "pending").length;
    const savings = cases
      .filter((c) => (c.status === "won" || c.status === "closed") && c.offer)
      .reduce((sum, c) => sum + (c.offer?.savings ?? 0), 0);
    return { open, pending, sent, savings };
  }, [cases]);

  const notifications = useMemo(() => {
    const items: { icon: string; text: string; time: string }[] = [];
    for (const c of cases) {
      if (c.status === "pending") {
        items.push({ icon: "ic-sparkle", text: `תיק חדש ממתין להצעה שלך — ${c.id}`, time: c.receivedAt });
      } else if (c.status === "won") {
        items.push({ icon: "ic-check-circle", text: `זכית בתיק ${c.id} — אפשר ליצור קשר עם הלקוח`, time: c.receivedAt });
      } else if (c.status === "closed") {
        items.push({ icon: "ic-check-circle", text: `עסקה הושלמה בתיק ${c.id}`, time: c.receivedAt });
      }
    }
    return items;
  }, [cases]);

  const selected = cases.find((c) => c.id === selectedId) ?? null;

  function openCase(id: string) {
    setSelectedId(id);
  }

  function updateCase(id: string, patch: Partial<AdvisorCase>) {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  return (
    <div className="advisor-root">
      <AdvisorIcons />

      <div className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <ArthurMascot className="w-7 h-7" />
            <div>
              <span>מאורת הדובי</span>
              <small>לוח הבקרה ליועצי משכנתאות</small>
            </div>
          </div>
          <div className="top-actions">
            <div className="bell-wrap">
              <button
                className="bell-btn"
                type="button"
                onClick={() => {
                  setBellOpen((v) => !v);
                  setBellSeen(true);
                }}
              >
                <svg><use href="#ic-bell" /></svg>
                {notifications.length > 0 && !bellSeen && <span className="bell-dot" />}
              </button>
              {bellOpen && (
                <div className="bell-panel">
                  <div className="bell-panel__head">התראות אחרונות</div>
                  {notifications.length === 0 ? (
                    <div className="notif"><svg><use href="#ic-clock" /></svg><div><p>אין התראות חדשות כרגע</p></div></div>
                  ) : (
                    notifications.map((n, i) => (
                      <div className="notif" key={i}><svg><use href={`#${n.icon}`} /></svg><div><p>{n.text}</p><time>{n.time}</time></div></div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="advisor-chip">
              {commission.logoUrl ? (
                <img className="advisor-chip__avatar" src={commission.logoUrl} alt="" style={{ objectFit: "cover" }} />
              ) : (
                <div className="advisor-chip__avatar">{advisorName.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
              )}
              <div className="advisor-chip__info">
                <strong>{advisorName}</strong>
                <small>יועץ/ת משכנתאות</small>
              </div>
            </div>
            <SignOutButton className="btn btn-ghost" />
          </div>
        </div>
      </div>

      <div className="page">
        {loading ? (
          <div className="empty">טוען תיקים…</div>
        ) : !selected ? (
          <ListView cases={cases} stats={stats} onOpen={openCase} />
        ) : (
          <DetailView
            case_={selected}
            advisorId={advisorId}
            advisorName={advisorName}
            commission={commission}
            onBack={() => setSelectedId(null)}
            onUpdate={(patch) => updateCase(selected.id, patch)}
          />
        )}
      </div>
    </div>
  );
}

function ListView({
  cases,
  stats,
  onOpen,
}: {
  cases: AdvisorCase[];
  stats: { open: number; pending: number; sent: number; savings: number };
  onOpen: (id: string) => void;
}) {
  return (
    <>
      <div className="stat-row" style={{ marginBottom: 22 }}>
        <div className="stat-tile"><span>תיקים פתוחים</span><b className="num">{stats.open}</b><em>{stats.pending} חדשים לטיפול</em></div>
        <div className="stat-tile"><span>ממתינים להצעה</span><b className="num">{stats.pending}</b><em>לטפל בהקדם</em></div>
        <div className="stat-tile"><span>הצעות שנשלחו החודש</span><b className="num">{stats.sent}</b><em>מתוכן ממתינות לתשובה</em></div>
        <div className="stat-tile"><span>חיסכון שסופק ללקוחות</span><b className="num">{shekel(stats.savings)}</b><em>בתיקים שנסגרו</em></div>
      </div>

      <div className="section-head">
        <h2>התיקים שלך</h2>
        <span>{cases.length} תיקים בסך הכל</span>
      </div>
      <div className="case-list" style={{ marginTop: 12 }}>
        {cases.map((c) => {
          const calc = computeCase(c);
          return (
            <button key={c.id} type="button" className="case-row" onClick={() => onOpen(c.id)}>
              <span className="case-row__icon"><svg><use href={`#${LABELS.specialtyIcon[c.requestType]}`} /></svg></span>
              <span className="case-row__main">
                <strong>{c.id} · {LABELS.requestType[c.requestType]}</strong>
                <small>{LABELS.goal[c.goal]} · התקבל {c.receivedAt}</small>
              </span>
              <span className="case-row__payment">
                <span>החזר חודשי</span>
                <b className="num">{shekel(calc.payment)}</b>
              </span>
              <span className="case-row__badges">
                <span className={`band-${calc.band}`}>{calc.band === "good" ? "בתוך הנוח" : calc.band === "watch" ? "לשים לב" : "מעל הסף"}</span>
                {c.complex && <span className="complex-badge"><svg><use href="#ic-search" /></svg>תיק מורכב</span>}
              </span>
              <span className={`pill ${STATUS_META[c.status].cls}`}>{STATUS_META[c.status].label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function DetailView({
  case_: c,
  advisorId,
  advisorName,
  commission,
  onBack,
  onUpdate,
}: {
  case_: AdvisorCase;
  advisorId: string;
  advisorName: string;
  commission: { commissionType: "percent" | "fixed" | null; commissionValue: number | null };
  onBack: () => void;
  onUpdate: (patch: Partial<AdvisorCase>) => void;
}) {
  const calc = computeCase(c);
  const needleDeg = -90 + Math.max(0, Math.min(1, calc.ratio / 0.6)) * 180;
  const keyPoints = deriveKeyPoints(c);

  const [offerSavings, setOfferSavings] = useState(Math.round(calc.suggestedSavings / 500) * 500);
  const [offerFee, setOfferFee] = useState(2500);
  const [offerNotes, setOfferNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  async function downloadCleanDoc() {
    setDownloadingDoc(true);
    setDocError(null);
    const url = await getCleanDocUrl(c.id);
    setDownloadingDoc(false);
    if (!url) {
      setDocError("לא הצלחנו ליצור קישור להורדה. נסו שוב, ואם זה חוזר ספרו לצוות התפעול.");
      return;
    }
    window.open(url, "_blank");
  }

  const showOfferForm = c.status === "pending";
  const commissionOnFee = computeCommission(offerFee, commission.commissionType, commission.commissionValue);

  async function sendOffer() {
    setSending(true);
    const ok = await submitOffer(c.id, advisorId, { savings: offerSavings, fee: offerFee, notes: offerNotes });
    setSending(false);
    if (ok) {
      onUpdate({ status: "sent", offer: { savings: offerSavings, fee: offerFee } });
      confettiBurst();
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "offer-submitted",
          caseId: c.id,
          advisorName,
          savings: offerSavings,
          fee: offerFee,
        }),
      }).catch((err) => console.error("Failed to trigger offer-submitted email:", err));
    }
  }

  return (
    <>
      <div className="detail-head" style={{ marginBottom: 18 }}>
        <button className="back-btn" type="button" onClick={onBack}>
          <svg><use href="#ic-back" /></svg>כל התיקים
        </button>
        <div className="detail-title">
          <h2>{c.id}</h2>
          <small>{LABELS.requestType[c.requestType]} · התקבל {c.receivedAt}{c.complex ? " · תיק מורכב 🕵️" : ""}</small>
        </div>
        <span className={`pill ${STATUS_META[c.status].cls}`}>{STATUS_META[c.status].label}</span>
      </div>

      <div className="detail-layout">
        <div className="detail-layout__main">
          {c.client && (
            <div className="card" style={{ borderColor: "var(--good)" }}>
              <h3><svg><use href="#ic-check-circle" /></svg>מזל טוב, זכיתם בתיק! פרטי הלקוח</h3>
              <div className="brief-grid">
                {briefRow("שם מלא", c.client.name)}
                {briefRow("טלפון", c.client.phone)}
                {briefRow("מייל", c.client.email)}
              </div>
              <div className="anon-note" style={{ marginTop: 12 }}>
                אפשר ליצור קשר ישירות עם הלקוח כדי לסגור את התהליך.
              </div>
            </div>
          )}
          {keyPoints.length > 0 && (
            <div className="card" style={{ borderColor: "var(--accent)" }}>
              <h3><svg><use href="#ic-sparkle" /></svg>נקודות חשובות</h3>
              <ul style={{ margin: 0, paddingInlineStart: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5, color: "var(--ink-soft)" }}>
                {keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="card">
            <h3><svg><use href="#ic-target" /></svg>בקשה ומטרה</h3>
            <div className="brief-grid">
              {briefRow("סוג בקשה", LABELS.requestType[c.requestType])}
              {briefRow("מטרה", LABELS.goal[c.goal])}
            </div>
          </div>
          <div className="card">
            <h3><svg><use href="#ic-home" /></svg>פרטי הנכס</h3>
            <div className="brief-grid">
              {briefRow("שווי נכס", shekel(c.property.value))}
              {briefRow("גובה משכנתה", shekel(c.property.mortgage))}
              {briefRow("הון עצמי", shekel(c.equity))}
              {briefRow("סטטוס רישום", LABELS.legal[c.property.legal])}
              {c.property.source && briefRow("אופן הרכישה", LABELS.propertySource[c.property.source] ?? c.property.source)}
            </div>
          </div>
          <div className="card">
            <h3><svg><use href="#ic-clock" /></svg>תכנון פיננסי</h3>
            <div className="brief-grid">
              {briefRow(
                "שחרור כספים עתידי",
                c.planning.futureRelease === "yes"
                  ? `כן, ${shekel(c.planning.futureReleaseAmount ?? 0)}${c.planning.futureReleaseTiming ? ` · ${LABELS.futureReleaseTiming[c.planning.futureReleaseTiming]}` : ""}`
                  : LABELS.yesno[c.planning.futureRelease]
              )}
              {briefRow("הוצאה גדולה מתוכננת", LABELS.upcomingEvent[c.planning.upcomingEvent] ?? c.planning.upcomingEvent)}
              {briefRow("שינוי צפוי בהכנסה", LABELS.yesno[c.planning.incomeChange])}
            </div>
          </div>
          <div className="card">
            <h3><svg><use href="#ic-user" /></svg>פרופיל והכנסות</h3>
            <div className="brief-grid">
              {briefRow("מבקש 1", `${LABELS.employment[c.profile.employment1]} · ותק ${LABELS.seniority[c.profile.seniority1]}`)}
              {c.profile.hasSecond === "yes" && c.profile.employment2 && c.profile.seniority2 &&
                briefRow("מבקש 2", `${LABELS.employment[c.profile.employment2]} · ותק ${LABELS.seniority[c.profile.seniority2]}`)}
              {briefRow("הכנסה נטו", shekel(c.income.net + c.income.extra))}
              {briefRow(
                "הלוואות נוספות",
                c.credit.otherLoans === "yes"
                  ? `כן, ${shekel(c.credit.otherLoansPayment ?? 0)}/חודש${
                      c.credit.otherLoansEndingSoon === "yes" && c.credit.otherLoansMonthsLeft
                        ? ` · מסתיימות בעוד ${LABELS.monthsLeft[c.credit.otherLoansMonthsLeft]}`
                        : ""
                    }`
                  : "אין"
              )}
              {briefRow("חיווי אשראי", c.credit.creditIssues === "yes" ? "דורש תשומת לב" : "תקין")}
            </div>
          </div>
          <div className="card">
            <h3><svg><use href="#ic-doc" /></svg>מסמכים שצורפו</h3>
            {c.cleanDocName && (
              <button type="button" className="btn-link" style={{ alignSelf: "flex-start" }} disabled={downloadingDoc} onClick={downloadCleanDoc}>
                {downloadingDoc ? "יוצר קישור…" : `הורדת דוח יתרות (ללא פרטים אישיים) — ${c.cleanDocName}`}
              </button>
            )}
            {docError && (
              <div className="match-note warn">
                <svg><use href="#ic-alert" /></svg>{docError}
              </div>
            )}
            {c.docTracks.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {c.docSource === "manual" && (
                  <div className="match-note warn">
                    <svg><use href="#ic-alert" /></svg>הפרטים הוזנו ידנית על ידי הלקוח (לא נשלף ממסמך) — כדאי לוודא מולו שהם מדויקים.
                  </div>
                )}
                {(() => {
                  const commonBank = c.docTracks.every((t) => t.bankName && t.bankName === c.docTracks[0].bankName)
                    ? c.docTracks[0].bankName
                    : null;
                  return commonBank && <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>בנק: {commonBank}</div>;
                })()}
                {c.docTracks.map((t, i) => (
                  <div
                    className="brief-grid"
                    key={i}
                    style={{ paddingBottom: 10, borderBottom: i < c.docTracks.length - 1 ? "1px solid var(--line)" : undefined }}
                  >
                    <div className="brief-item">
                      <span>מסלול {String.fromCharCode(0x5d0 + i)}׳</span>
                      <b>
                        {t.rateKind === "fixed"
                          ? "קבועה"
                          : t.rateKind === "variable"
                          ? t.anchorBasis?.includes("פריים")
                            ? "פריים"
                            : t.anchorBasis
                            ? `משתנה (${t.anchorBasis})`
                            : "משתנה"
                          : "לא ידוע"}
                        {t.linkedToCpi ? " · צמודה למדד" : ""}
                      </b>
                    </div>
                    {t.annualRate != null && briefRow("ריבית שנתית", `${t.annualRate}%`)}
                    {t.anchorRate != null && briefRow("ריבית עוגן", `${t.anchorRate}%`)}
                    {t.marginRate != null && briefRow("מרווח מעל העוגן", `${t.marginRate}%`)}
                    {t.nextRateChangeDate && briefRow("שינוי ריבית קרוב", t.nextRateChangeDate)}
                    {t.repaymentMethod && briefRow("שיטת פרעון", t.repaymentMethod)}
                    {t.monthsRemaining != null && briefRow("יתרת תקופה", `${t.monthsRemaining} חודשים`)}
                    {t.principalBalance != null && briefRow("יתרת קרן", shekel(t.principalBalance))}
                    {t.accruedInterest != null && briefRow("ריבית צבורה", shekel(t.accruedInterest))}
                    {t.payoffBalance != null && briefRow("יתרה לסילוק (מסלול)", shekel(t.payoffBalance))}
                    {t.earlyRepaymentFee != null && briefRow("עמלת פרעון מוקדם", shekel(t.earlyRepaymentFee))}
                    {t.comparisonRate != null && briefRow("ריבית לצרכי השוואה", `${t.comparisonRate}%`)}
                    {t.forecastRate != null && briefRow("ריבית כוללת חזויה", `${t.forecastRate}%`)}
                    {(t.arrearsBalance ?? 0) > 0 && briefRow("יתרת פיגור", shekel(t.arrearsBalance ?? 0))}
                    {(t.arrearsInterest ?? 0) > 0 && briefRow("ריבית פיגורים", shekel(t.arrearsInterest ?? 0))}
                  </div>
                ))}
                {(c.docTotals.totalEarlyRepaymentFee != null || c.docTotals.totalPayoff != null) && (
                  <div className="brief-grid">
                    {c.docTotals.totalPayoff != null && briefRow("סה״כ יתרה לסילוק", shekel(c.docTotals.totalPayoff))}
                    {c.docTotals.totalEarlyRepaymentFee != null &&
                      briefRow("סה״כ עמלת פרעון מוקדם", shekel(c.docTotals.totalEarlyRepaymentFee))}
                    {c.docTotals.accountComparisonRate != null &&
                      briefRow("ריבית לצרכי השוואה (חשבון)", `${c.docTotals.accountComparisonRate}%`)}
                  </div>
                )}
                <div className="anon-note">
                  &ldquo;ריבית לצרכי השוואה&rdquo; כבר כוללת בתוכה את עמלת הפרעון המוקדם ואת תחזית הריבית — זו הריבית האפקטיבית להשוואה מול הצעה חדשה.
                </div>
              </div>
            ) : (
              <div className="brief-grid">
                {briefRow("יתרת קרן (הערכה)", shekel(c.doc.balance))}
                {briefRow("ריבית שנתית ממוצעת", `${c.doc.rate}%`)}
                {briefRow("תקופה שנותרה", `${c.doc.years} שנים ו-${c.doc.months} חודשים`)}
              </div>
            )}
            <div className="anon-note" style={{ marginTop: 12 }}>
              התיק מוצג ללא שם או פרטי קשר של הלקוח, בהתאם למדיניות הפרטיות שלנו. פרטי הקשר יועברו רק אם ההצעה שלכם תיבחר.
            </div>
          </div>
        </div>

        <div className="detail-layout__side">
          <div className="card">
            <h3 style={{ paddingBottom: 10 }}>יכולת החזר מחושבת</h3>
            <div className="gauge-wrap" style={{ ["--glow" as string]: `var(--${calc.band})` }}>
              <div className="gauge">
                <div className="gauge__arc" />
                <div className="gauge__hole" />
                <div className="gauge__needle" style={{ transform: `rotate(${needleDeg}deg)` }} />
                <div className="gauge__hub" />
              </div>
              <div className="ratio-big">יחס החזר מהכנסה<b className="num">{(calc.ratio * 100).toFixed(0)}%</b></div>
              <span className={`band-${calc.band}`} style={{ alignSelf: "center" }}>
                {calc.band === "good" ? "בתוך ההחזר הנוח ללקוח" : calc.band === "watch" ? "מעל הנוח, בתוך הסף המקסימלי" : "מעל הסף המקסימלי"}
              </span>
            </div>
            <div className="statrow" style={{ marginTop: 14 }}>
              <div className="stat"><span>החזר חודשי</span><b className="num">{shekel(calc.payment)}</b></div>
              <div className="stat"><span>הכנסה פנויה</span><b className="num">{shekel(calc.totalIncome)}</b></div>
            </div>
            <div className="statrow" style={{ marginTop: 10 }}>
              <div className="stat"><span>החזר נוח ללקוח</span><b className="num">{shekel(c.repayment.comfort)}</b></div>
              <div className="stat"><span>סף מקסימלי</span><b className="num">{shekel(c.repayment.max)}</b></div>
            </div>
          </div>

          <div className="card">
            <h3><svg><use href="#ic-sparkle" /></svg>סימולטור הצעה מהיר</h3>
            {showOfferForm ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="suggested-note">
                  <svg><use href="#ic-sparkle" /></svg>הצעת מערכת: לפי נתוני התיק, פוטנציאל חיסכון משוער של {shekel(calc.suggestedSavings)} לאורך חיי ההלוואה.
                </div>
                <div className="field">
                  <label>חיסכון משוער ללקוח</label>
                  <div className="prefix-input"><span>₪</span><input type="number" step={500} value={offerSavings} onChange={(e) => setOfferSavings(Number(e.target.value) || 0)} /></div>
                </div>
                <div className="field">
                  <label>הצעת מחיר לשכר טרחה (כולל מע״מ)</label>
                  <div className="prefix-input"><span>₪</span><input type="number" step={100} value={offerFee} onChange={(e) => setOfferFee(Number(e.target.value) || 0)} /></div>
                  {commission.commissionType && (
                    <small className="hint">עמלה לארתור מתוך הסכום הזה: {shekel(commissionOnFee)} ({commission.commissionType === "fixed" ? "סכום קבוע" : `${commission.commissionValue}%`})</small>
                  )}
                </div>
                <div className="field">
                  <label>הערות ודגשים לתיק</label>
                  <small className="hint">יוצג ללקוח יחד עם ההצעה</small>
                  <textarea placeholder="לדוגמה: מומלץ לשלב מסלול משתנה כדי לנצל את הריבית הנוכחית..." value={offerNotes} onChange={(e) => setOfferNotes(e.target.value)} />
                </div>
                <button className="btn btn-primary" type="button" style={{ width: "100%" }} disabled={sending} onClick={sendOffer}>
                  {sending ? "שולח…" : "שליחת הצעה ללקוח"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="sent-note">
                  <svg><use href="#ic-check-circle" /></svg>
                  <p>
                    {c.offer
                      ? `נשלחה הצעה עם חיסכון משוער ${shekel(c.offer.savings)} ושכר טרחה ${shekel(c.offer.fee)}.` +
                        (c.status === "won"
                          ? " הלקוח אישר את ההצעה 🎉"
                          : c.status === "closed"
                          ? " העסקה בוצעה בהצלחה 🎉"
                          : c.status === "closed_no_deal"
                          ? " התיק נסגר ללא ביצוע."
                          : c.status === "lost"
                          ? " הלקוח בחר יועץ אחר."
                          : " ממתין לתשובת הלקוח.")
                      : "ההצעה נשלחה ללקוח בהצלחה. תקבלו התראה כאן ברגע שתתקבל תשובה."}
                  </p>
                </div>
                {c.completionNote && (
                  <div className="anon-note">הערת סגירה ({c.completedBy === "advisor" ? "שלך" : "מהצוות"}): {c.completionNote}</div>
                )}
                {c.status === "won" && <AdvisorCaseCompletion caseId={c.id} onUpdate={onUpdate} />}
              </div>
            )}
          </div>

          <div className="card">
            <h3><svg><use href="#ic-sparkle" /></svg>שיחה עם הצוות</h3>
            <CaseChat caseId={c.id} sender={{ kind: "advisor", advisorId, name: advisorName }} />
          </div>
        </div>
      </div>
    </>
  );
}

function AdvisorCaseCompletion({ caseId, onUpdate }: { caseId: string; onUpdate: (patch: Partial<AdvisorCase>) => void }) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState<"closed" | "closed_no_deal" | null>(null);

  async function submit(outcome: "closed" | "closed_no_deal") {
    setSending(outcome);
    const ok = await submitCompletion(caseId, outcome, note);
    setSending(null);
    if (ok) {
      onUpdate({ status: outcome, completionNote: note || null, completedBy: "advisor" });
      if (outcome === "closed") confettiBurst();
    }
  }

  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="field">
        <label>כמה מילים על התיק (אופציונלי)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="לדוגמה: הלקוח חתם, מסמכים הועברו לבנק..." />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={sending !== null} onClick={() => submit("closed")}>
          {sending === "closed" ? "מעדכן…" : "העסקה בוצעה"}
        </button>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} disabled={sending !== null} onClick={() => submit("closed_no_deal")}>
          {sending === "closed_no_deal" ? "מעדכן…" : "לא בוצעה עסקה"}
        </button>
      </div>
    </div>
  );
}
