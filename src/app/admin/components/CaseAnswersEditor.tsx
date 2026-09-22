"use client";

import { useState } from "react";
import { AdminCase, LABELS } from "../lib/data";
import { CaseAnswersPatch, updateCaseAnswers } from "../lib/fetchCases";

/**
 * תיקון התשובות שהלקוח מסר באשף. לקוחות טועים, ולפעמים מבהירים משהו בטלפון
 * אחרי שכבר שלחו — עד עכשיו לא הייתה שום דרך לתקן חוץ מפנייה ישירה למסד.
 * שדות ההדפסה, נקודות תשומת הלב וההמלצות כולם נגזרים מהערכים האלה, ולכן
 * תיקון כאן מתקן גם את הדוח שהיועץ רואה.
 */

const inputStyle: React.CSSProperties = {
  fontSize: 12.5,
  borderRadius: 8,
  border: "1.5px solid var(--line)",
  background: "var(--surface)",
  color: "var(--ink)",
  padding: "6px 8px",
  width: "100%",
};

type Answers = CaseAnswersPatch;

function toAnswers(c: AdminCase): Answers {
  return {
    request_type: c.requestType,
    goal: c.goal,
    property_value: c.brief.propertyValue,
    mortgage_amount: c.brief.mortgage,
    equity: c.brief.equity,
    appraisal_value: c.brief.appraisalValue,
    property_legal: c.brief.propertyLegal,
    property_source: c.brief.propertySource,
    selling_existing: c.brief.sellingExisting,
    oldest_age: c.profile.oldestAge,
    has_zakaut: c.zakaut,
    income: c.answers.incomeBase,
    extra: c.answers.extra,
    comfort_payment: c.answers.comfortPayment,
    max_stress_payment: c.answers.maxStressPayment,
    has_second_applicant: c.profile.hasSecond,
    employment1: c.profile.employment1,
    seniority1: c.profile.seniority1,
    employment2: c.profile.employment2 ?? null,
    seniority2: c.profile.seniority2 ?? null,
    other_loans: c.credit.otherLoans,
    other_loans_payment: c.credit.otherLoansPayment,
    other_loans_ending_soon: c.credit.otherLoansEndingSoon ?? null,
    other_loans_months_left: c.credit.otherLoansMonthsLeft ?? null,
    credit_issues: c.credit.creditIssues,
    future_release: c.planning.futureRelease,
    future_release_amount: c.planning.futureReleaseAmount,
    future_release_timing: c.planning.futureReleaseTiming,
    upcoming_event: c.planning.upcomingEvent,
    income_change: c.planning.incomeChange,
  };
}

/** מחזיר את העריכה לצורת AdminCase, כדי שהמסך יתעדכן בלי לטעון הכול מחדש. */
function toCasePatch(a: Answers, c: AdminCase): Partial<AdminCase> {
  return {
    requestType: a.request_type as AdminCase["requestType"],
    goal: a.goal,
    zakaut: a.has_zakaut,
    brief: {
      ...c.brief,
      propertyValue: a.property_value,
      mortgage: a.mortgage_amount,
      equity: a.equity,
      appraisalValue: a.appraisal_value,
      propertyLegal: a.property_legal,
      propertySource: a.property_source,
      sellingExisting: a.selling_existing,
      income: a.income + a.extra,
    },
    answers: {
      incomeBase: a.income,
      extra: a.extra,
      comfortPayment: a.comfort_payment,
      maxStressPayment: a.max_stress_payment,
    },
    profile: {
      hasSecond: a.has_second_applicant,
      employment1: a.employment1,
      seniority1: a.seniority1,
      employment2: a.employment2 ?? undefined,
      seniority2: a.seniority2 ?? undefined,
      oldestAge: a.oldest_age,
    },
    credit: {
      otherLoans: a.other_loans,
      otherLoansPayment: a.other_loans_payment,
      otherLoansEndingSoon: a.other_loans_ending_soon ?? undefined,
      otherLoansMonthsLeft: a.other_loans_months_left ?? undefined,
      creditIssues: a.credit_issues,
    },
    planning: {
      futureRelease: a.future_release,
      futureReleaseAmount: a.future_release_amount,
      futureReleaseTiming: a.future_release_timing,
      upcomingEvent: a.upcoming_event,
      incomeChange: a.income_change,
    },
  };
}

const GOALS_NEW = ["singleHome", "investment", "upgrade"];
const GOALS_EXISTING = ["maximizeSavings", "lower", "shorten", "closeExpensive", "cash"];

export function CaseAnswersEditor({ case_: c, onUpdate }: { case_: AdminCase; onUpdate: (patch: Partial<AdminCase>) => void }) {
  const [open, setOpen] = useState(false);
  const [a, setA] = useState<Answers>(() => toAnswers(c));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function field<K extends keyof Answers>(key: K, value: Answers[K]) {
    setA((prev) => ({ ...prev, [key]: value }));
  }

  function openEditor() {
    setA(toAnswers(c));
    setError(null);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const ok = await updateCaseAnswers(c.id, a);
    setSaving(false);
    if (!ok) {
      setError("השמירה נכשלה. נסו שוב בעוד רגע.");
      return;
    }
    onUpdate(toCasePatch(a, c));
    setOpen(false);
  }

  const isNew = a.request_type === "new";

  if (!open) {
    return (
      <div className="card">
        <h3><svg><use href="#ic-doc" /></svg>תיקון תשובות הלקוח</h3>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 12px" }}>
          אם הלקוח טעה במילוי או הבהיר משהו בשיחה — אפשר לתקן כאן. התיקון מתעדכן מיד גם בנקודות לתשומת הלב
          ובדוח שהיועץ מפיק.
        </p>
        <button type="button" className="btn btn-ghost" onClick={openEditor}>פתיחת התשובות לעריכה</button>
      </div>
    );
  }

  return (
    <div className="card" style={{ borderColor: "var(--accent)" }}>
      <h3><svg><use href="#ic-doc" /></svg>תיקון תשובות הלקוח</h3>

      <Group title="סיווג העסקה">
        <Select label="סוג הבקשה" value={a.request_type} options={LABELS.requestType} onChange={(v) => field("request_type", v)} />
        <Select
          label="מטרה"
          value={a.goal}
          options={Object.fromEntries((isNew ? GOALS_NEW : GOALS_EXISTING).map((k) => [k, LABELS.goal[k]]))}
          onChange={(v) => field("goal", v)}
        />
        {a.goal === "upgrade" && (
          <Select
            label="מכירת הדירה הקיימת"
            value={a.selling_existing ?? ""}
            options={{ before: "לפני הרכישה", after: "אחרי הרכישה", no: "לא מוכרים" }}
            onChange={(v) => field("selling_existing", v || null)}
            allowEmpty
          />
        )}
      </Group>

      <Group title="הנכס והמימון">
        <Num label="שווי הנכס" value={a.property_value} onChange={(v) => field("property_value", v ?? 0)} />
        <Num label="גובה המשכנתה" value={a.mortgage_amount} onChange={(v) => field("mortgage_amount", v ?? 0)} />
        <Num label="הון עצמי" value={a.equity} onChange={(v) => field("equity", v ?? 0)} />
        <Num label="שמאות (ריק = טרם בוצעה)" value={a.appraisal_value} onChange={(v) => field("appraisal_value", v)} />
        <Select label="סטטוס רישום" value={a.property_legal} options={LABELS.legal} onChange={(v) => field("property_legal", v)} />
        <Select
          label="אופן הרכישה"
          value={a.property_source ?? ""}
          options={LABELS.propertySource}
          onChange={(v) => field("property_source", v || null)}
          allowEmpty
        />
      </Group>

      <Group title="הלווים">
        <Num label="גיל הלווה המבוגר" value={a.oldest_age} onChange={(v) => field("oldest_age", v ?? 0)} />
        <Select label="תעודת זכאות" value={a.has_zakaut ?? ""} options={LABELS.yesno} onChange={(v) => field("has_zakaut", v || null)} allowEmpty />
        <Select label="מבקש נוסף" value={a.has_second_applicant} options={{ yes: "כן", no: "לא" }} onChange={(v) => field("has_second_applicant", v)} />
        <Select label="מבקש 1 — תעסוקה" value={a.employment1} options={LABELS.employment} onChange={(v) => field("employment1", v)} />
        <Select label="מבקש 1 — ותק" value={a.seniority1} options={LABELS.seniority} onChange={(v) => field("seniority1", v)} />
        {a.has_second_applicant === "yes" && (
          <>
            <Select label="מבקש 2 — תעסוקה" value={a.employment2 ?? ""} options={LABELS.employment} onChange={(v) => field("employment2", v || null)} allowEmpty />
            <Select label="מבקש 2 — ותק" value={a.seniority2 ?? ""} options={LABELS.seniority} onChange={(v) => field("seniority2", v || null)} allowEmpty />
          </>
        )}
      </Group>

      <Group title="יכולת החזר">
        <Num label="הכנסה נטו" value={a.income} onChange={(v) => field("income", v ?? 0)} />
        <Num label="הכנסה נוספת" value={a.extra} onChange={(v) => field("extra", v ?? 0)} />
        <Num label="החזר שנוח ללקוח" value={a.comfort_payment} onChange={(v) => field("comfort_payment", v ?? 0)} />
        <Num label="החזר מקסימלי" value={a.max_stress_payment} onChange={(v) => field("max_stress_payment", v ?? 0)} />
        <Select label="הלוואות נוספות" value={a.other_loans} options={{ yes: "כן", no: "אין" }} onChange={(v) => field("other_loans", v)} />
        {a.other_loans === "yes" && (
          <>
            <Num label="החזר חודשי עליהן" value={a.other_loans_payment} onChange={(v) => field("other_loans_payment", v)} />
            <Select
              label="מסתיימת בקרוב"
              value={a.other_loans_ending_soon ?? ""}
              options={{ yes: "כן", no: "לא" }}
              onChange={(v) => field("other_loans_ending_soon", v || null)}
              allowEmpty
            />
            {a.other_loans_ending_soon === "yes" && (
              <Select
                label="כמה חודשים נשארו"
                value={a.other_loans_months_left ?? ""}
                options={LABELS.monthsLeft}
                onChange={(v) => field("other_loans_months_left", v || null)}
                allowEmpty
              />
            )}
          </>
        )}
        <Select label="חיווי אשראי" value={a.credit_issues} options={{ yes: "דורש תשומת לב", no: "תקין" }} onChange={(v) => field("credit_issues", v)} />
      </Group>

      <Group title="תכנון פיננסי">
        <Select label="שחרור כספים עתידי" value={a.future_release} options={LABELS.yesno} onChange={(v) => field("future_release", v)} />
        {a.future_release === "yes" && (
          <>
            <Num label="סכום צפוי" value={a.future_release_amount} onChange={(v) => field("future_release_amount", v)} />
            <Select
              label="מתי"
              value={a.future_release_timing ?? ""}
              options={LABELS.futureReleaseTiming}
              onChange={(v) => field("future_release_timing", v || null)}
              allowEmpty
            />
          </>
        )}
        <Select label="הוצאה גדולה מתוכננת" value={a.upcoming_event} options={LABELS.upcomingEvent} onChange={(v) => field("upcoming_event", v)} />
        <Select label="שינוי צפוי בהכנסה" value={a.income_change} options={LABELS.yesno} onChange={(v) => field("income_change", v)} />
      </Group>

      {error && (
        <div className="match-note warn" style={{ marginTop: 12 }}>
          <svg><use href="#ic-alert" /></svg>{error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? "שומר…" : "שמירת התיקונים"}
        </button>
        <button type="button" className="btn-link" onClick={() => setOpen(false)}>ביטול</button>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: "0 0 18px" }}>
      <legend style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", padding: 0, marginBottom: 8 }}>{title}</legend>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>{children}</div>
    </fieldset>
  );
}

function Label({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{label}</span>
      {children}
    </label>
  );
}

function Num({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <Label label={label}>
      <input
        type="number"
        style={inputStyle}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </Label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  allowEmpty,
}: {
  label: string;
  value: string;
  options: Record<string, string>;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <Label label={label}>
      <select style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
        {allowEmpty && <option value="">— לא נמסר —</option>}
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </Label>
  );
}
