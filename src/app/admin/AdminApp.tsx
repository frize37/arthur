"use client";

import { useEffect, useMemo, useState } from "react";
import "./admin.css";
import { AdminIcons } from "./components/AdminIcons";
import { Advisor, AdminCase, CaseStatus, LABELS, Offer, STATUS_META, TABS } from "./lib/data";
import { assignAdvisorsToCase, fetchAdvisors, fetchCases, persistWinner } from "./lib/fetchCases";
import { shekel } from "../wizard/lib/finance";
import { confettiBurst } from "../wizard/lib/effects";
import { SignOutButton } from "@/components/SignOutButton";

function briefRow(label: string, value: string) {
  return (
    <div className="brief-item" key={label}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export function AdminApp({ adminName }: { adminName: string }) {
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [advisors, setAdvisors] = useState<Record<string, Advisor>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<CaseStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [advisorMap, caseList] = await Promise.all([fetchAdvisors(), fetchCases()]);
      if (cancelled) return;
      setAdvisors(advisorMap);
      setCases(caseList);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const closedSavings = cases
      .filter((c) => c.status === "closed")
      .reduce((sum, c) => sum + (c.offers.find((o) => o.winner)?.savings ?? 0), 0);
    return {
      total: cases.length,
      closed: cases.filter((c) => c.status === "closed").length,
      unassigned: cases.filter((c) => c.status === "new").length,
      verifying: cases.filter((c) => c.status === "verifying").length,
      ready: cases.filter((c) => c.status === "ready").length,
      savings: closedSavings,
    };
  }, [cases]);

  const visibleCases = activeFilter === "all" ? cases : cases.filter((c) => c.status === activeFilter);
  const selected = cases.find((c) => c.id === selectedId) ?? null;

  function updateCase(id: string, patch: Partial<AdminCase>) {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  return (
    <div className="admin-root">
      <AdminIcons />

      <div className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <svg><use href="#ic-tower" /></svg>
            <div>
              <span>מצפה הדובי</span>
              <small>קונסולת ניהול פנימית</small>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="admin-chip">
              <div className="admin-chip__avatar">{adminName.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
              <div className="admin-chip__info">
                <strong>{adminName}</strong>
                <small>הרשאת מנהל</small>
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
          <>
            <div className="stat-row" style={{ marginBottom: 22 }}>
              <div className="stat-tile"><span>תיקים החודש</span><b className="num">{stats.total}</b><em>{stats.closed} נסגרו בהצלחה</em></div>
              <div className="stat-tile"><span>ממתינים להקצאה</span><b className="num">{stats.unassigned}</b><em>צריך לבחור יועצים</em></div>
              <div className="stat-tile"><span>ממתינים לאימות זהות</span><b className="num">{stats.verifying}</b><em>לא ניתן לשלוח ליועצים</em></div>
              <div className="stat-tile"><span>מוכנים לבחירת מנצח</span><b className="num">{stats.ready}</b><em>4/4 הצעות התקבלו</em></div>
              <div className="stat-tile"><span>חיסכון שאושר ללקוחות</span><b className="num">{shekel(stats.savings)}</b><em>בתיקים שנסגרו</em></div>
            </div>

            <div className="section-head">
              <h2>כל התיקים</h2>
              <span>{visibleCases.length} תיקים מוצגים</span>
            </div>
            <div className="tab-row" style={{ margin: "12px 0 6px" }}>
              {TABS.map((t) => {
                const count = t.key === "all" ? cases.length : cases.filter((c) => c.status === t.key).length;
                return (
                  <button key={t.key} type="button" className="tab" aria-pressed={activeFilter === t.key} onClick={() => setActiveFilter(t.key)}>
                    {t.label} <span className="count">{count}</span>
                  </button>
                );
              })}
            </div>
            <div className="case-list" style={{ marginTop: 10 }}>
              {visibleCases.length === 0 ? (
                <div className="empty">אין תיקים בסטטוס הזה כרגע.</div>
              ) : (
                visibleCases.map((c) => {
                  const progress =
                    c.status === "new" ? "טרם הוקצה ליועצים" : c.status === "verifying" ? "טרם נשלח" : `${c.offers.length} הצעות התקבלו`;
                  return (
                    <button key={c.id} type="button" className="case-row" onClick={() => setSelectedId(c.id)}>
                      <span className="case-row__icon"><svg><use href={`#${LABELS.specialtyIcon[c.requestType]}`} /></svg></span>
                      <span className="case-row__main">
                        <strong>{c.id} · {LABELS.requestType[c.requestType]}</strong>
                        <small>{LABELS.goal[c.goal]} · התקבל {c.receivedAt}</small>
                      </span>
                      <span className="case-row__progress"><span>סטטוס הצעות</span><b>{progress}</b></span>
                      <span className="case-row__badges">
                        {c.complex && <span className="complex-badge"><svg><use href="#ic-search" /></svg>תיק מורכב</span>}
                      </span>
                      <span className={`pill ${STATUS_META[c.status].cls}`}>{STATUS_META[c.status].label}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="section-head" style={{ marginTop: 8 }}>
              <h2>ביצועי יועצים</h2>
              <span>לפי תיקים שנסגרו וזמן תגובה ממוצע</span>
            </div>
            <div className="card">
              <div className="lead-table">
                {Object.values(advisors)
                  .sort((a, b) => b.casesWon - a.casesWon)
                  .map((a) => {
                    const initials = a.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
                    return (
                      <div className="lead-row" key={a.id}>
                        <div className="lead-row__avatar">{initials}</div>
                        <div className="lead-row__info"><strong>{a.name}</strong><small>{a.specialty}</small></div>
                        <div className="lead-row__stat"><span>דירוג</span><b>★ {a.rating}</b></div>
                        <div className="lead-row__stat"><span>תיקים שנסגרו</span><b>{a.casesWon}</b></div>
                        <div className="lead-row__stat"><span>זמן תגובה</span><b>{a.avgResponseHours} ש׳</b></div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        ) : (
          <DetailView key={selected.id} case_={selected} advisors={advisors} onBack={() => setSelectedId(null)} onUpdate={(patch) => updateCase(selected.id, patch)} />
        )}
      </div>
    </div>
  );
}

function DetailView({
  case_: c,
  advisors,
  onBack,
  onUpdate,
}: {
  case_: AdminCase;
  advisors: Record<string, Advisor>;
  onBack: () => void;
  onUpdate: (patch: Partial<AdminCase>) => void;
}) {
  const [selectedOfferIdx, setSelectedOfferIdx] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function confirmWinner() {
    if (selectedOfferIdx === null) return;
    const winnerAdvisor = advisors[c.offers[selectedOfferIdx].advisorId];
    const offers: Offer[] = c.offers.map((o, i) => ({ ...o, winner: i === selectedOfferIdx }));
    setConfirming(true);
    await persistWinner(c.id, offers);
    setConfirming(false);
    onUpdate({
      status: "sent",
      offers,
      timeline: [...c.timeline, { label: `נבחרה הצעת ${winnerAdvisor.name} ונשלחה ללקוח`, time: "עכשיו" }],
    });
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
          <small>{LABELS.requestType[c.requestType]} · {LABELS.goal[c.goal]}{c.complex ? " · תיק מורכב 🕵️" : ""}</small>
        </div>
        <span className={`pill ${STATUS_META[c.status].cls}`}>{STATUS_META[c.status].label}</span>
      </div>

      <div className="detail-layout">
        <div className="detail-layout__main">
          <div className="card">
            <h3><svg><use href="#ic-user" /></svg>זהות הלקוח (פנימי בלבד — לא מוצג ליועצים)</h3>
            <div className="identity-row"><span>שם מלא</span><b>{c.client.name}</b></div>
            <div className="identity-row">
              <span><svg style={{ width: 13, height: 13, verticalAlign: -2 }}><use href="#ic-phone" /></svg> טלפון</span>
              <b>{c.client.phone}</b> <span className={`verify-badge ${c.client.phoneVerified ? "ok" : "pending"}`}>{c.client.phoneVerified ? "מאומת" : "ממתין"}</span>
            </div>
            <div className="identity-row">
              <span><svg style={{ width: 13, height: 13, verticalAlign: -2 }}><use href="#ic-mail" /></svg> מייל</span>
              <b>{c.client.email}</b> <span className={`verify-badge ${c.client.emailVerified ? "ok" : "pending"}`}>{c.client.emailVerified ? "מאומת" : "ממתין"}</span>
            </div>
          </div>

          <div className="card">
            <h3><svg><use href="#ic-home" /></svg>תקציר התיק</h3>
            <div className="brief-grid">
              {briefRow("שווי נכס", shekel(c.brief.propertyValue))}
              {briefRow("גובה משכנתה", shekel(c.brief.mortgage))}
              {briefRow("הכנסה נטו", shekel(c.brief.income))}
              {briefRow("יחס החזר", c.brief.ratioBand === "good" ? "בתוך הנוח" : c.brief.ratioBand === "watch" ? "לשים לב" : "מעל הסף")}
            </div>
          </div>

          {c.status === "new" ? (
            <div className="card">
              <h3><svg><use href="#ic-send" /></svg>הקצאת התיק ליועצים</h3>
              <AssignAdvisors
                caseId={c.id}
                advisors={advisors}
                onAssigned={(ids) =>
                  onUpdate({
                    status: "awaiting",
                    assignedAdvisorIds: ids,
                    timeline: [...c.timeline, { label: `התיק הוקצה ל-${ids.length} יועצים`, time: "עכשיו" }],
                  })
                }
              />
            </div>
          ) : (
          <div className="card">
            <h3><svg><use href="#ic-send" /></svg>השוואת הצעות מהיועצים</h3>
            <OfferCompare c={c} advisors={advisors} selectedOfferIdx={selectedOfferIdx} onSelect={setSelectedOfferIdx} />
            {(c.status === "ready" || c.status === "awaiting") && c.offers.length > 0 && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="btn btn-primary" type="button" style={{ width: "100%" }} disabled={selectedOfferIdx === null || confirming} onClick={confirmWinner}>
                  {confirming ? "שולח…" : "אשרו את ההצעה שנבחרה ושלחו ללקוח"}
                </button>
                <div className="anon-note">הבחירה כאן היא שלכם — המערכת רק מציגה את הנתונים לצד הצעת פתיחה חכמה, ההחלטה הסופית תמיד אנושית.</div>
              </div>
            )}
            {(c.status === "sent" || c.status === "closed") && (
              <div className="sent-note" style={{ marginTop: 14 }}>
                <svg><use href="#ic-check-circle" /></svg>
                <p>
                  {(() => {
                    const w = c.offers.find((o) => o.winner) ?? c.offers[0];
                    const wa = advisors[w.advisorId];
                    return c.status === "closed"
                      ? `ההצעה של ${wa.name} נשלחה, הלקוח אישר, והתיק נסגר בהצלחה.`
                      : `ההצעה של ${wa.name} נשלחה ללקוח — ממתינים לתשובה.`;
                  })()}
                </p>
              </div>
            )}
          </div>
          )}
        </div>

        <div className="detail-layout__side">
          <div className="card">
            <h3><svg><use href="#ic-clock" /></svg>יומן התיק</h3>
            <div className="timeline">
              {c.timeline.map((t, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot"><svg><use href={`#${i === c.timeline.length - 1 ? "ic-clock" : "ic-check-circle"}`} /></svg></div>
                  <div className="timeline-content"><strong>{t.label}</strong><small>{t.time}</small></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function OfferCompare({
  c,
  advisors,
  selectedOfferIdx,
  onSelect,
}: {
  c: AdminCase;
  advisors: Record<string, Advisor>;
  selectedOfferIdx: number | null;
  onSelect: (idx: number) => void;
}) {
  if (c.status === "verifying") {
    return (
      <div className="offer-pending">
        <svg><use href="#ic-alert" /></svg>התיק ממתין לאימות זהות הלקוח — לא ניתן לשלוח ליועצים עדיין.
      </div>
    );
  }
  if (c.offers.length === 0) {
    return (
      <div className="offer-pending">
        <svg><use href="#ic-clock" /></svg>נשלח ל-{c.assignedAdvisorIds.length} יועצים, טרם התקבלו הצעות.
      </div>
    );
  }
  if (c.status === "sent" || c.status === "closed") {
    const w = c.offers.find((o) => o.winner) ?? c.offers[0];
    return (
      <div className="offer-compare">
        <OfferCard offer={w} advisor={advisors[w.advisorId]} readOnly />
      </div>
    );
  }
  return (
    <div className="offer-compare">
      {c.offers.map((o, idx) => (
        <OfferCard key={o.advisorId} offer={o} advisor={advisors[o.advisorId]} selected={selectedOfferIdx === idx} onClick={() => onSelect(idx)} />
      ))}
      {c.status === "awaiting" && c.assignedAdvisorIds.length > c.offers.length && (
        <div className="offer-pending" style={{ gridColumn: "1/-1" }}>
          <svg><use href="#ic-clock" /></svg>עדיין ממתינים ל-{c.assignedAdvisorIds.length - c.offers.length} הצעות נוספות — אפשר לבחור כבר עכשיו מבין ההצעות שהתקבלו, או להמתין להשלמת התמונה.
        </div>
      )}
    </div>
  );
}

function OfferCard({
  offer,
  advisor,
  selected,
  readOnly,
  onClick,
}: {
  offer: Offer;
  advisor: Advisor | undefined;
  selected?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
}) {
  const a = advisor ?? { name: "יועץ לא ידוע", specialty: "", rating: 0 };
  const initials = a.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <div
      className={"offer-card" + (selected ? " selected" : "")}
      style={readOnly ? { cursor: "default" } : undefined}
      onClick={readOnly ? undefined : onClick}
    >
      {!readOnly && <span className="offer-card__radio" />}
      <div className="offer-card__head">
        <span className="offer-card__avatar">{initials}</span>
        <div>
          <strong>{a.name}</strong>
          <small>{a.specialty} · ★{a.rating}</small>
        </div>
      </div>
      <div className="offer-card__stats">
        <div><span>חיסכון משוער</span><b className="num">{shekel(offer.savings)}</b></div>
        <div><span>שכר טרחה</span><b className="num">{shekel(offer.fee)}</b></div>
      </div>
      {offer.notes && <div className="offer-card__notes">{offer.notes}</div>}
      <small style={{ color: "var(--ink-faint)", fontSize: 10.5 }}>התקבל {offer.submittedAt}</small>
    </div>
  );
}

function AssignAdvisors({
  caseId,
  advisors,
  onAssigned,
}: {
  caseId: string;
  advisors: Record<string, Advisor>;
  onAssigned: (advisorIds: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function send() {
    if (selected.length === 0) return;
    setSending(true);
    const ok = await assignAdvisorsToCase(caseId, selected);
    setSending(false);
    if (ok) {
      onAssigned(selected);
      confettiBurst();
    }
  }

  const advisorList = Object.values(advisors);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="anon-note">בחרו יועץ אחד או יותר לשלוח אליהם את התיק. אפשר לבחור את כולם או רק חלק, לפי שיקול דעתכם.</div>
      <div className="lead-table">
        {advisorList.map((a) => {
          const initials = a.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
          const checked = selected.includes(a.id);
          return (
            <label
              className="lead-row"
              key={a.id}
              style={{ cursor: "pointer", outline: checked ? "2px solid var(--accent)" : undefined, borderRadius: 12 }}
            >
              <input type="checkbox" checked={checked} onChange={() => toggle(a.id)} style={{ width: 16, height: 16 }} />
              <div className="lead-row__avatar">{initials}</div>
              <div className="lead-row__info"><strong>{a.name}</strong><small>{a.specialty}</small></div>
              <div className="lead-row__stat"><span>דירוג</span><b>★ {a.rating}</b></div>
              <div className="lead-row__stat"><span>תיקים שנסגרו</span><b>{a.casesWon}</b></div>
            </label>
          );
        })}
      </div>
      <button className="btn btn-primary" type="button" disabled={selected.length === 0 || sending} onClick={send}>
        {sending ? "שולח…" : selected.length === 0 ? "בחרו יועצים לשליחה" : `שלחו את התיק ל-${selected.length} יועצים שנבחרו`}
      </button>
    </div>
  );
}
