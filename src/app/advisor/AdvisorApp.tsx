"use client";

import { useMemo, useState } from "react";
import "./advisor.css";
import { AdvisorIcons } from "./components/AdvisorIcons";
import { ArthurMascot } from "@/components/ArthurMascot";
import { AdvisorCase, LABELS, MOCK_CASES, STATUS_META, computeCase } from "./lib/data";
import { shekel } from "../wizard/lib/finance";
import { confettiBurst } from "../wizard/lib/effects";

function briefRow(label: string, value: string) {
  return (
    <div className="brief-item" key={label}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export function AdvisorApp() {
  const [cases, setCases] = useState<AdvisorCase[]>(MOCK_CASES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [bellSeen, setBellSeen] = useState(false);

  const stats = useMemo(() => {
    const open = cases.filter((c) => c.status === "pending" || c.status === "sent").length;
    const pending = cases.filter((c) => c.status === "pending").length;
    const sent = cases.filter((c) => c.status === "sent" || c.status === "won" || c.status === "lost").length;
    const savings = cases.filter((c) => c.status === "won" && c.offer).reduce((sum, c) => sum + (c.offer?.savings ?? 0), 0);
    return { open, pending, sent, savings };
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
                {!bellSeen && <span className="bell-dot" />}
              </button>
              {bellOpen && (
                <div className="bell-panel">
                  <div className="bell-panel__head">התראות אחרונות</div>
                  <div className="notif"><svg><use href="#ic-sparkle" /></svg><div><p>תיק חדש הותאם להתמחות שלך — #C-1042</p><time>לפני 20 דקות</time></div></div>
                  <div className="notif"><svg><use href="#ic-check-circle" /></svg><div><p>הלקוח אישר את ההצעה בתיק #C-1039</p><time>אתמול, 18:42</time></div></div>
                  <div className="notif"><svg><use href="#ic-clock" /></svg><div><p>תזכורת: תיק #C-1035 ממתין להצעה כבר יומיים</p><time>אתמול, 09:10</time></div></div>
                </div>
              )}
            </div>
            <div className="advisor-chip">
              <div className="advisor-chip__avatar">ר.כ</div>
              <div className="advisor-chip__info">
                <strong>רותם כהן</strong>
                <small>מומחית מיחזור ואיחוד הלוואות</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page">
        {!selected && (
          <ListView cases={cases} stats={stats} onOpen={openCase} />
        )}
        {selected && (
          <DetailView case_={selected} onBack={() => setSelectedId(null)} onUpdate={(patch) => updateCase(selected.id, patch)} />
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
  onBack,
  onUpdate,
}: {
  case_: AdvisorCase;
  onBack: () => void;
  onUpdate: (patch: Partial<AdvisorCase>) => void;
}) {
  const calc = computeCase(c);
  const needleDeg = -90 + Math.max(0, Math.min(1, calc.ratio / 0.6)) * 180;

  const [offerSavings, setOfferSavings] = useState(Math.round(calc.suggestedSavings / 500) * 500);
  const [offerFee, setOfferFee] = useState(2500);
  const [offerNotes, setOfferNotes] = useState("");

  const showOfferForm = c.status === "pending";

  function sendOffer() {
    onUpdate({ status: "sent", offer: { savings: offerSavings, fee: offerFee } });
    confettiBurst();
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
              {briefRow("סטטוס רישום", LABELS.legal[c.property.legal])}
            </div>
          </div>
          <div className="card">
            <h3><svg><use href="#ic-clock" /></svg>תכנון פיננסי</h3>
            <div className="brief-grid">
              {briefRow("שחרור כספים עתידי", LABELS.yesno[c.planning.futureRelease])}
              {briefRow("הוצאה גדולה מתוכננת", c.planning.upcomingEvent === "none" ? "אין" : c.planning.upcomingEvent)}
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
              {briefRow("הלוואות נוספות", c.credit.otherLoans === "yes" ? "כן" : "אין")}
              {briefRow("חיווי אשראי", c.credit.creditIssues === "yes" ? "דורש תשומת לב" : "תקין")}
            </div>
          </div>
          <div className="card">
            <h3><svg><use href="#ic-doc" /></svg>מסמכים שצורפו</h3>
            <div className="brief-grid">
              {briefRow("יתרת קרן (מהמסמך)", shekel(c.doc.balance))}
              {briefRow("ריבית שנתית ממוצעת", `${c.doc.rate}%`)}
              {briefRow("תקופה שנותרה", `${c.doc.years} שנים ו-${c.doc.months} חודשים`)}
            </div>
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
                  <label>הצעת מחיר לשכר טרחה</label>
                  <div className="prefix-input"><span>₪</span><input type="number" step={100} value={offerFee} onChange={(e) => setOfferFee(Number(e.target.value) || 0)} /></div>
                </div>
                <div className="field">
                  <label>הערות ודגשים לתיק</label>
                  <small className="hint">יוצג ללקוח יחד עם ההצעה</small>
                  <textarea placeholder="לדוגמה: מומלץ לשלב מסלול משתנה כדי לנצל את הריבית הנוכחית..." value={offerNotes} onChange={(e) => setOfferNotes(e.target.value)} />
                </div>
                <button className="btn btn-primary" type="button" style={{ width: "100%" }} onClick={sendOffer}>
                  שליחת הצעה ללקוח
                </button>
              </div>
            ) : (
              <div className="sent-note">
                <svg><use href="#ic-check-circle" /></svg>
                <p>
                  {c.offer
                    ? `נשלחה הצעה עם חיסכון משוער ${shekel(c.offer.savings)} ושכר טרחה ${shekel(c.offer.fee)}.` +
                      (c.status === "won" ? " הלקוח אישר את ההצעה 🎉" : c.status === "lost" ? " הלקוח בחר יועץ אחר." : " ממתין לתשובת הלקוח.")
                    : "ההצעה נשלחה ללקוח בהצלחה. תקבלו התראה כאן ברגע שתתקבל תשובה."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
