"use client";

import type { StageProps } from "../lib/reducer";
import { isComplexCase } from "../lib/types";
import { shekel } from "../lib/finance";
import { BuddyRow, ChipRow, ChoiceGroup, Field, NavRow, Reveal, SliderField, Subhead } from "../components/ui";

export function RequestTypeStage({ state, set, go }: StageProps) {
  return (
    <section className="stage">
      <BuddyRow bubble="נעים להכיר, אני ארתור. בסוף התהליך יושב יועץ אמיתי שיטפל בכם — אני רק דואג שכמה מהטובים יתחרו על התיק שלכם. ואת דוח היתרות אני לא שומר אצלי, רק שולף ממנו את המספרים. נתחיל מהבסיס: מה אתם עושים היום?" />
      <div className="card">
        <ChoiceGroup
          value={state.requestType}
          onSelect={(v) => set("requestType", v as typeof state.requestType)}
          options={[
            { value: "new", icon: "ic-home", title: "משכנתה חדשה", subtitle: "רכישת נכס וקבלת משכנתה לראשונה" },
            { value: "refinance", icon: "ic-down", title: "מחזור משכנתה קיימת", subtitle: "לשפר תנאים על המשכנתה שיש לכם היום" },
            { value: "consolidate", icon: "ic-merge", title: "איחוד הלוואות / הרחבה", subtitle: "לאחד הלוואות יקרות או להגדיל את המשכנתה הקיימת" },
          ]}
        />
      </div>
      <NavRow showBack={false} onNext={() => go("goal")} nextDisabled={!state.requestType} />
    </section>
  );
}

export function GoalStage({ state, set, go, back }: StageProps) {
  const isNew = state.requestType === "new";
  return (
    <section className="stage">
      <BuddyRow bubble={isNew ? "מה המטרה המרכזית ברכישה? זה עוזר לנו להתאים את המסלול הנכון כבר מהצעד הראשון." : "מה הכי חשוב לכם כרגע? הבחירה הזו קובעת אילו מסלולים נבדוק בשבילכם קודם."} />
      <div className="card">
        {!isNew && (
          <ChoiceGroup
            value={state.goal}
            onSelect={(v) => set("goal", v)}
            options={[
              { value: "maximizeSavings", icon: "ic-coins", title: "לחסוך כמה שיותר כסף", subtitle: "נבדוק את כל האפשרויות ונמקסם את החיסכון הכולל" },
              { value: "lower", icon: "ic-down", title: "הקטנת ההחזר החודשי", subtitle: "להוריד את העומס השוטף ולרווח בתשלומים" },
              { value: "shorten", icon: "ic-clock", title: "קיצור תקופת המשכנתא", subtitle: "לסיים מוקדם יותר ולחסוך בריבית הכוללת" },
              { value: "closeExpensive", icon: "ic-merge", title: "סגירת הלוואות יקרות", subtitle: "לאחד הלוואות קצרות מועד עם החזר גבוה" },
              { value: "cash", icon: "ic-cash", title: "גיוס סכום נוסף", subtitle: "לשיפוץ, אירוע משפחתי או עזרה לילדים" },
            ]}
          />
        )}
        {isNew && (
          <ChoiceGroup
            value={state.goal}
            onSelect={(v) => set("goal", v)}
            options={[
              { value: "singleHome", icon: "ic-home", title: "רכישת דירה יחידה", subtitle: "דירה למגורים, הדירה היחידה שלכם" },
              { value: "investment", icon: "ic-cash", title: "רכישת דירה להשקעה", subtitle: "נכס נוסף שלא משמש למגורים שלכם" },
              { value: "upgrade", icon: "ic-clock", title: "שדרוג דירה קיימת", subtitle: "דירת חליפין — מוכרים וקונים בו-זמנית" },
            ]}
          />
        )}
      </div>
      <NavRow onBack={back} onNext={() => go("property")} nextDisabled={!state.goal} />
    </section>
  );
}

export function PropertyStage({ state, set, go, back }: StageProps) {
  const isNew = state.requestType === "new";
  // בלי החסימה הזו השדות מגיעים ריקים למסד ומוצגים ליועץ עם ברירת מחדל שהלקוח לא בחר.
  const incomplete =
    !state.propertyLegal ||
    (isNew && !state.propertySource) ||
    (isNew && state.goal === "upgrade" && !state.sellingExisting);
  return (
    <section className="stage">
      <BuddyRow bubble="כמה פרטים על הנכס עצמו — זה קובע איזה מסמכים נצטרך ואיזה מסלולים רלוונטיים." />
      <div className="card card--form">
        {isNew && (
          <>
            {/* מטרת הרכישה כבר אומרת כמה דירות יש בבעלות — "שדרוג" פירושו שיש
                אחת, "יחידה" שאין, "להשקעה" שיש לפחות אחת. השאלה היחידה שנשארת
                פתוחה היא התזמון אצל משפרי דיור, והיא זו שקובעת 75% מול 70%. */}
            {state.goal === "upgrade" && (
              <Field label="מתי תמכרו את הדירה הקיימת?">
                <ChipRow
                  value={state.sellingExisting}
                  onSelect={(v) => set("sellingExisting", v as typeof state.sellingExisting)}
                  options={[
                    { value: "before", label: "לפני הרכישה" },
                    { value: "after", label: "אחרי הרכישה" },
                    { value: "no", label: "לא מוכרים" },
                  ]}
                />
                <small className="hint">
                  מי שמוכר לפני נחשב מחוסר דיור ומקבל תקרת מימון גבוהה יותר — זה ההבדל בין 75% ל-70%.
                </small>
              </Field>
            )}
            <Field label="ממי קונים את הנכס?">
              <ChipRow
                value={state.propertySource}
                onSelect={(v) => set("propertySource", v)}
                options={[
                  { value: "contractor", label: "מקבלן (על הנייר)" },
                  { value: "secondhand", label: "יד שנייה" },
                  { value: "selfbuild", label: "בנייה עצמית / תמ״א 38" },
                  { value: "discounted", label: "מחיר למשתכן / מופחת" },
                ]}
              />
            </Field>
          </>
        )}
        <Field label={isNew ? "מה סטטוס הרישום של הנכס?" : "מה סטטוס הרישום של הנכס הקיים?"}>
          <ChipRow
            value={state.propertyLegal}
            onSelect={(v) => set("propertyLegal", v)}
            options={[
              { value: "tabu", label: "רשום בטאבו" },
              { value: "rmi", label: "רמ״י / חברה משכנת" },
              { value: "pending", label: "עדיין בתהליכי רישום" },
            ]}
          />
        </Field>
      </div>
      <NavRow onBack={back} onNext={() => go("numbers")} nextDisabled={incomplete} />
    </section>
  );
}

export function NumbersStage({ state, set, go, back }: StageProps) {
  const isNew = state.requestType === "new";
  // במשכנתה חדשה הסכום נגזר: מה שחסר לרכישה אחרי ההון העצמי. מי שמזיז את
  // הסליידר מעבר לזה מבקש בעצם תוספת, ולכן נשאל במפורש אם זו הכוונה.
  const needed = Math.max(0, state.propertyValue - state.equity);
  const extra = isNew ? state.mortgageAmount - needed : 0;
  const extraConfirmed = extra > 0 && state.mortgageExtraConfirmedFor === state.mortgageAmount;
  const overValue = state.mortgageAmount > state.propertyValue;
  const shortfall = isNew && extra < 0 && -extra > state.propertyValue * 0.02;

  // שווי או הון עצמי השתנו — המשכנתה חוזרת לסכום שנגזר מהם.
  function setBase(field: "propertyValue" | "equity", v: number) {
    set(field, v);
    if (!isNew) return;
    const value = field === "propertyValue" ? v : state.propertyValue;
    const equity = field === "equity" ? v : state.equity;
    set("mortgageAmount", Math.max(0, value - equity));
    set("mortgageExtraConfirmedFor", null);
  }

  return (
    <section className="stage">
      <BuddyRow
        bubble={
          isNew
            ? "תנו לי את מחיר הנכס ואת ההון העצמי — את גובה המשכנתה אני כבר מחשב לבד. אפשר להעריך, נדייק אחר כך."
            : "כמה מספרים ראשוניים כדי שנוכל להתחיל לחשב עבורכם — אפשר להעריך, נדייק אחר כך מהמסמכים."
        }
      />
      <div className="card card--form">
        <SliderField label="שווי הנכס המוערך (או מחיר החוזה)" value={state.propertyValue} onChange={(v) => setBase("propertyValue", v)} min={500000} max={8000000} step={10000} />
        {isNew && <SliderField label="ההון העצמי הקיים" value={state.equity} onChange={(v) => setBase("equity", v)} min={0} max={4000000} step={10000} />}
        <div className="derived-field">
          <SliderField
            label={isNew ? "גובה המשכנתה" : "גובה המשכנתה הקיימת"}
            value={state.mortgageAmount}
            onChange={(v) => set("mortgageAmount", v)}
            min={200000}
            max={6000000}
            step={10000}
          />
          {isNew && extra === 0 && (
            <small className="hint">חושב אוטומטית: שווי הנכס פחות ההון העצמי. אפשר לשנות אם צריך יותר.</small>
          )}
        </div>
        {isNew && extra > 0 && !overValue && (
          <div className={"extra-ask" + (extraConfirmed ? " is-confirmed" : "")} role="group" aria-label="אישור תוספת למשכנתה">
            <p>
              לרכישה חסרים לכם <b>{shekel(needed)}</b>, וביקשתם <b>{shekel(state.mortgageAmount)}</b>.
              {extraConfirmed ? " סימנתי שאתם רוצים " : " האם אתם רוצים "}
              <b>תוספת של {shekel(extra)}</b>
              {extraConfirmed ? " מעבר לרכישה — למשל לשיפוץ או לסגירת הלוואות." : " מעבר לרכישה — למשל לשיפוץ או לסגירת הלוואות?"}
            </p>
            {!extraConfirmed ? (
              <div className="extra-ask__actions">
                <button type="button" className="btn btn-primary" onClick={() => set("mortgageExtraConfirmedFor", state.mortgageAmount)}>
                  כן, אני רוצה את התוספת
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => set("mortgageAmount", needed)}>
                  לא, רק מה שצריך לרכישה
                </button>
              </div>
            ) : (
              <button type="button" className="btn-link" onClick={() => { set("mortgageAmount", needed); set("mortgageExtraConfirmedFor", null); }}>
                בעצם בלי תוספת
              </button>
            )}
          </div>
        )}
        {overValue && (
          <div className="match-note warn">
            <svg><use href="#ic-alert" /></svg>
            המשכנתה גבוהה משווי הנכס. נראה שאחד המספרים לא מדויק.
          </div>
        )}
        {shortfall && (
          <div className="match-note warn">
            <svg><use href="#ic-alert" /></svg>
            {`המשכנתה וההון העצמי מכסים פחות ממחיר הנכס — חסרים כ-${shekel(-extra)}. בדקו שהמספרים מדויקים.`}
          </div>
        )}
      </div>
      <NavRow onBack={back} onNext={() => go("repayment")} nextDisabled={overValue || (extra > 0 && !extraConfirmed)} />
    </section>
  );
}

export function RepaymentStage({ state, set, go, back }: StageProps) {
  const inverted = state.maxStressPayment < state.comfortPayment;
  return (
    <section className="stage">
      <BuddyRow bubble="אני שואל כדי לוודא שכל תוכנית שנבנה תישאר נוחה עבורכם גם אם הריבית תעלה." />
      <div className="card card--form">
        <SliderField label="מה ההחזר החודשי שנוח לכם לשלם?" value={state.comfortPayment} onChange={(v) => set("comfortPayment", v)} min={1500} max={25000} step={100} />
        <SliderField label="מה ההחזר המקסימלי שתוכלו לעמוד בו אם הריבית תעלה?" value={state.maxStressPayment} onChange={(v) => set("maxStressPayment", v)} min={1500} max={30000} step={100} />
        {inverted && (
          <div className="match-note warn">
            <svg><use href="#ic-alert" /></svg>
            הסף המקסימלי נמוך מההחזר שנוח לכם — העלו אותו כדי שנדע עד לאן אפשר למתוח.
          </div>
        )}
      </div>
      <NavRow onBack={back} onNext={() => go("planning")} nextDisabled={inverted} />
    </section>
  );
}

export function PlanningStage({ state, set, go, back }: StageProps) {
  const incomplete =
    !state.futureRelease ||
    (state.futureRelease === "yes" && !state.futureReleaseTiming) ||
    !state.upcomingEvent ||
    !state.incomeChange;
  return (
    <section className="stage">
      <BuddyRow bubble="אני שואל על העתיד הקרוב כדי לוודא שהתוכנית שנבנה תחזיק מעמד גם אם משהו משתנה." />
      <div className="card card--form">
        <Field label="צפי לשחרר סכום כסף משמעותי ב-5 השנים הקרובות? (קרן השתלמות, חיסכון, מכירת נכס)">
          <ChipRow
            value={state.futureRelease}
            onSelect={(v) => set("futureRelease", v as typeof state.futureRelease)}
            options={[
              { value: "yes", label: "כן, צפוי" },
              { value: "no", label: "לא" },
              { value: "unsure", label: "עוד לא יודעים" },
            ]}
          />
        </Field>
        {state.futureRelease === "yes" && (
          <Reveal>
            <SliderField label="מה הסכום המשוער?" value={state.futureReleaseAmount} onChange={(v) => set("futureReleaseAmount", v)} min={10000} max={2000000} step={10000} />
            <Field label="מתי הוא צפוי להתקבל?">
              <ChipRow
                value={state.futureReleaseTiming}
                onSelect={(v) => set("futureReleaseTiming", v)}
                options={[
                  { value: "soon", label: "עד שנה" },
                  { value: "mid", label: "1–3 שנים" },
                  { value: "later", label: "3–5 שנים" },
                ]}
              />
            </Field>
          </Reveal>
        )}
        <Field label="האם מתוכננות הוצאות גדולות בשנים הקרובות?">
          <ChipRow
            value={state.upcomingEvent}
            onSelect={(v) => set("upcomingEvent", v)}
            options={[
              { value: "reno", label: "שיפוץ" },
              { value: "family", label: "אירוע משפחתי" },
              { value: "edu", label: "לימודים" },
              { value: "none", label: "אין כרגע" },
            ]}
          />
        </Field>
        <Field label="צפי לשינוי בהכנסה? (קידום, פרישה, שינוי בהיקף משרה)">
          <ChipRow
            value={state.incomeChange}
            onSelect={(v) => set("incomeChange", v as typeof state.incomeChange)}
            options={[
              { value: "yes", label: "כן, צפוי שינוי" },
              { value: "no", label: "לא, יציב" },
              { value: "unsure", label: "עוד לא יודעים" },
            ]}
          />
        </Field>
      </div>
      <NavRow onBack={back} onNext={() => go("employment")} nextDisabled={incomplete} />
    </section>
  );
}

export function EmploymentStage({ state, set, go, back }: StageProps) {
  const complex = isComplexCase(state);
  const incomplete =
    !state.hasSecondApplicant ||
    !state.employment1 ||
    !state.seniority1 ||
    (state.hasSecondApplicant === "yes" && (!state.employment2 || !state.seniority2));
  return (
    <section className="stage">
      <BuddyRow
        mood={complex ? "bear-detective" : "bear"}
        bubble={
          complex
            ? "תיק עם כמה מקורות הכנסה דורש קצת בלשות — כבר נתאים לכם יועץ שמתמחה בדיוק בזה."
            : "עכשיו נבדוק את יכולת ההחזר, כדי לוודא שכל תוכנית שנציע תשאיר לכם ראש שקט בסוף החודש."
        }
      />
      <div className="card card--form">
        <Field label="יש מבקש/ת נוסף/ת למשכנתה?">
          <ChipRow
            value={state.hasSecondApplicant}
            onSelect={(v) => set("hasSecondApplicant", v as typeof state.hasSecondApplicant)}
            options={[
              { value: "no", label: "רק אני" },
              { value: "yes", label: "כן, יש מבקש/ת נוסף/ת" },
            ]}
          />
        </Field>
        <SliderField
          label={state.hasSecondApplicant === "yes" ? "גיל המבוגר/ת מביניכם" : "בן/בת כמה אתם?"}
          value={state.oldestAge}
          onChange={(v) => set("oldestAge", v)}
          min={18}
          max={80}
          step={1}
          format={(n) => `${n}`}
        />
        <small className="hint" style={{ marginTop: -12 }}>
          הבנקים דורשים שהמשכנתה תסתיים עד גיל 75 — זה מה שקובע לכמה שנים אפשר לפרוס אותה.
        </small>
        <Subhead title="מבקש/ת 1" />
        <Field label="סטטוס תעסוקה">
          <ChipRow
            value={state.employment1}
            onSelect={(v) => set("employment1", v)}
            options={[
              { value: "salaried", label: "שכיר/ה" },
              { value: "selfemployed", label: "עצמאי/ת" },
              { value: "controlling", label: "בעל/ת שליטה" },
              { value: "none", label: "לא עובד/ת" },
            ]}
          />
        </Field>
        <Field label="ותק במקום העבודה / בעסק">
          <ChipRow
            value={state.seniority1}
            onSelect={(v) => set("seniority1", v)}
            options={[
              { value: "under1", label: "מתחת לשנה" },
              { value: "1to3", label: "1–3 שנים" },
              { value: "over3", label: "מעל 3 שנים" },
            ]}
          />
        </Field>
        {state.hasSecondApplicant === "yes" && (
          <Reveal>
            <Subhead title="מבקש/ת 2" tag="אופציונלי" />
            <Field label="סטטוס תעסוקה">
              <ChipRow
                value={state.employment2}
                onSelect={(v) => set("employment2", v)}
                options={[
                  { value: "salaried", label: "שכיר/ה" },
                  { value: "selfemployed", label: "עצמאי/ת" },
                  { value: "controlling", label: "בעל/ת שליטה" },
                  { value: "none", label: "לא עובד/ת" },
                ]}
              />
            </Field>
            <Field label="ותק במקום העבודה / בעסק">
              <ChipRow
                value={state.seniority2}
                onSelect={(v) => set("seniority2", v)}
                options={[
                  { value: "under1", label: "מתחת לשנה" },
                  { value: "1to3", label: "1–3 שנים" },
                  { value: "over3", label: "מעל 3 שנים" },
                ]}
              />
            </Field>
          </Reveal>
        )}
        <SliderField label="הכנסה נטו חודשית של משק הבית" value={state.income} onChange={(v) => set("income", v)} min={5000} max={45000} step={500} />
        <SliderField label="הכנסות נוספות קבועות (שכ״ד, קצבאות)" value={state.extra} onChange={(v) => set("extra", v)} min={0} max={10000} step={250} />
      </div>
      <NavRow onBack={back} onNext={() => go("credit")} nextDisabled={incomplete} />
    </section>
  );
}

export function CreditStage({ state, set, go, back }: StageProps) {
  function goToDocuments() {
    if (!state.docConfirmed) set("docBalance", Math.round(state.mortgageAmount / 1000) * 1000);
    go("documents");
  }
  const complex = isComplexCase(state);
  const incomplete =
    !state.otherLoans ||
    (state.otherLoans === "yes" && !state.otherLoansEndingSoon) ||
    (state.otherLoansEndingSoon === "yes" && !state.otherLoansMonthsLeft) ||
    !state.creditIssues;
  return (
    <section className="stage">
      <BuddyRow
        mood={complex ? "bear-detective" : "bear"}
        bubble={
          complex
            ? 'קלטתי — זה בדיוק המידע שעוזר לנו לשייך אתכם ליועץ עם ניסיון בתיקים כאלה. בלי שיפוט, רק התאמה טובה יותר.'
            : 'כמה שאלות רכות שעוזרות לנו לשייך אתכם ליועץ עם הניסיון המתאים — אין תשובה "לא טובה" כאן.'
        }
      />
      <div className="card card--form">
        <Field label="יש הלוואות נוספות פעילות כיום? (לא כולל המשכנתה)">
          <ChipRow
            value={state.otherLoans}
            onSelect={(v) => set("otherLoans", v as typeof state.otherLoans)}
            options={[
              { value: "no", label: "אין" },
              { value: "yes", label: "כן, יש" },
            ]}
          />
        </Field>
        {state.otherLoans === "yes" && (
          <Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <SliderField label="מה סך ההחזר החודשי שלהן?" value={state.otherLoansPayment} onChange={(v) => set("otherLoansPayment", v)} min={0} max={15000} step={100} />
              <Field label="אחת מההלוואות האלה מסתיימת בקרוב?" hint="הלוואה שנגמרת עד כ-18 חודשים לא נלקחת בחשבון בבדיקת ההחזר החדש.">
                <ChipRow
                  value={state.otherLoansEndingSoon}
                  onSelect={(v) => set("otherLoansEndingSoon", v as typeof state.otherLoansEndingSoon)}
                  options={[
                    { value: "no", label: "לא, נמשכות עוד הרבה" },
                    { value: "yes", label: "כן, מסתיימת בקרוב" },
                  ]}
                />
              </Field>
              {state.otherLoansEndingSoon === "yes" && (
                <Reveal>
                  <Field label="כמה חודשים נשארו לה?">
                    <ChipRow
                      value={state.otherLoansMonthsLeft}
                      onSelect={(v) => set("otherLoansMonthsLeft", v as typeof state.otherLoansMonthsLeft)}
                      options={[
                        { value: "under6", label: "עד 6 חודשים" },
                        { value: "6to12", label: "7–12 חודשים" },
                        { value: "13to18", label: "13–18 חודשים" },
                        { value: "over18", label: "מעל 18 חודשים" },
                      ]}
                    />
                  </Field>
                </Reveal>
              )}
            </div>
          </Reveal>
        )}
        <Field label="היו בשנים האחרונות חזרות של צ'קים, הוראות קבע, או חיווי אשראי לא תקין?" hint="עוזר לנו להתאים יועץ שמתמחה בתיקים כאלה — לא משפיע על הזכאות שלכם כאן.">
          <ChipRow
            value={state.creditIssues}
            onSelect={(v) => set("creditIssues", v as typeof state.creditIssues)}
            options={[
              { value: "no", label: "לא" },
              { value: "yes", label: "כן, קרה" },
            ]}
          />
        </Field>
      </div>
      <NavRow onBack={back} onNext={goToDocuments} nextDisabled={incomplete} />
    </section>
  );
}
