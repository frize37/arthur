"use client";

import { useRef } from "react";
import Image from "next/image";
import type { StageProps } from "../lib/reducer";
import { isComplexCase } from "../lib/types";
import { heroLandingEffects } from "../lib/effects";
import { BuddyRow, ChipRow, ChoiceGroup, Field, NavRow, Reveal, SliderField, Subhead } from "../components/ui";
import { RiggedBear } from "../components/RiggedBear";

export function WelcomeStage({ go }: StageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <section className="stage">
      <div className="hero-fullbleed">
        <div className="hero-wrap">
          <div className="hero-band">
            <div className="hero-band__diagonal" />
            <div className="hero-band__inner">
              <div className="hero-band__glow" />
              <div className="sticker sticker--coin">₪</div>
              <div className="sticker sticker--pop">
                <svg viewBox="0 0 24 24"><path d="M12 4v13m0 0-5-5m5 5 5-5" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div className="sticker sticker--teal">
                <svg viewBox="0 0 24 24"><path d="M12 2 14.5 9 22 9 16 13.5 18 21 12 16.5 6 21 8 13.5 2 9 9.5 9Z" fill="currentColor" /></svg>
              </div>
              <div className="hero-band__copy">
                <span className="kicker-onhero">🕵️ לא אתם מחפשים יועץ — היועצים מתחרים עליכם</span>
                <h1>
                  אל תיקחו משכנתה
                  <br />
                  לפני ש<span className="hl">ארתור בודק</span>.
                </h1>
                <p>כמה שאלות פשוטות, דוח יתרות אחד — ותוך זמן קצר יועצי משכנתאות מתחרים על התיק שלכם. תדעו בדיוק כמה תחסכו ומה זה יעלה.</p>
              </div>
              <div
                className="hero-band__stage"
                ref={stageRef}
                onAnimationEnd={(e) => {
                  if (e.animationName === "heroDrop" && stageRef.current) heroLandingEffects(stageRef.current);
                }}
              >
                <div className="hero-bear-drop">
                  <RiggedBear />
                </div>
              </div>
            </div>
            <svg className="skyline" viewBox="0 0 400 60" preserveAspectRatio="none">
              <path d="M0,60 L0,38 L30,38 L30,24 L55,24 L55,40 L80,40 L80,20 L100,20 L100,10 L120,10 L120,42 L150,42 L150,28 L175,28 L175,46 L205,46 L205,16 L230,16 L230,6 L250,6 L250,44 L280,44 L280,30 L305,30 L305,48 L335,48 L335,22 L360,22 L360,38 L400,38 L400,60 Z" fill="rgba(0,0,0,0.18)" />
            </svg>
          </div>
          <button type="button" className="float-cta" onClick={() => go("requestType")}>
            <Image className="peek" src="/brand/arthur-bear-full.png" alt="" width={80} height={80} />
            <span className="txt">בואו נתחיל</span>
            <span className="chev">‹‹</span>
          </button>
        </div>
      </div>

      <div className="trust-row">
        <div className="trust-badge"><div className="trust-badge__icon"><svg><use href="#ic-down" /></svg></div><span>עד 50% חיסכון</span></div>
        <div className="trust-badge"><div className="trust-badge__icon"><svg><use href="#ic-upload" /></svg></div><span>יועצים מתחרים על התיק</span></div>
        <div className="trust-badge"><div className="trust-badge__icon"><svg><use href="#ic-clock" /></svg></div><span>2 דקות וההצעה בדרך</span></div>
        <div className="trust-badge"><div className="trust-badge__icon"><svg><use href="#ic-cash" /></svg></div><span>ליווי אישי צמוד</span></div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card-badge">🔒 מאובטח ופרטי</div>
        <BuddyRow bubble="כל תשובה כאן חשובה לדיוק ההצעה שתקבלו — אין תשובות מיותרות. ואת דוח היתרות אני לא שומר אצלי, רק שולף ממנו את המספרים." />
        <button type="button" className="btn btn-primary" style={{ width: "100%", fontSize: 16, padding: 15 }} onClick={() => go("requestType")}>
          בואו נתחיל
        </button>
      </div>
    </section>
  );
}

export function RequestTypeStage({ state, set, go, back }: StageProps) {
  return (
    <section className="stage">
      <BuddyRow bubble="כדי להתאים לכם בדיוק את המומחה ואת המסלול הנכון, בואו נתחיל מהבסיס — מה אתם עושים היום?" />
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
      <NavRow onBack={back} onNext={() => go("goal")} nextDisabled={!state.requestType} />
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
  return (
    <section className="stage">
      <BuddyRow bubble="כמה פרטים על הנכס עצמו — זה קובע איזה מסמכים נצטרך ואיזה מסלולים רלוונטיים." />
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {isNew && (
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
      <NavRow onBack={back} onNext={() => go("numbers")} />
    </section>
  );
}

export function NumbersStage({ state, set, go, back }: StageProps) {
  const isNew = state.requestType === "new";
  return (
    <section className="stage">
      <BuddyRow bubble="כמה מספרים ראשוניים כדי שנוכל להתחיל לחשב עבורכם — אפשר להעריך, נדייק אחר כך מהמסמכים." />
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SliderField label="שווי הנכס המוערך (או מחיר החוזה)" value={state.propertyValue} onChange={(v) => set("propertyValue", v)} min={500000} max={8000000} step={10000} />
        <SliderField
          label={isNew ? "גובה המשכנתה המבוקשת" : "גובה המשכנתה הקיימת"}
          value={state.mortgageAmount}
          onChange={(v) => set("mortgageAmount", v)}
          min={200000}
          max={6000000}
          step={10000}
        />
        {isNew && <SliderField label="ההון העצמי הקיים" value={state.equity} onChange={(v) => set("equity", v)} min={0} max={4000000} step={10000} />}
      </div>
      <NavRow onBack={back} onNext={() => go("repayment")} />
    </section>
  );
}

export function RepaymentStage({ state, set, go, back }: StageProps) {
  return (
    <section className="stage">
      <BuddyRow bubble="אני שואל כדי לוודא שכל תוכנית שנבנה תישאר נוחה עבורכם גם אם הריבית תעלה." />
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SliderField label="מה ההחזר החודשי שנוח לכם לשלם?" value={state.comfortPayment} onChange={(v) => set("comfortPayment", v)} min={1500} max={25000} step={100} />
        <SliderField label="מה ההחזר המקסימלי שתוכלו לעמוד בו אם הריבית תעלה?" value={state.maxStressPayment} onChange={(v) => set("maxStressPayment", v)} min={1500} max={30000} step={100} />
      </div>
      <NavRow onBack={back} onNext={() => go("planning")} />
    </section>
  );
}

export function PlanningStage({ state, set, go, back }: StageProps) {
  return (
    <section className="stage">
      <BuddyRow bubble="אני שואל על העתיד הקרוב כדי לוודא שהתוכנית שנבנה תחזיק מעמד גם אם משהו משתנה." />
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
      <NavRow onBack={back} onNext={() => go("employment")} />
    </section>
  );
}

export function EmploymentStage({ state, set, go, back }: StageProps) {
  const complex = isComplexCase(state);
  return (
    <section className="stage">
      <BuddyRow
        mood={complex ? "bear-detective" : "bear"}
        bubble={
          complex
            ? "תיק עם כמה מקורות הכנסה דורש קצת בלשות 🕵️ — כבר נתאים לכם יועץ שמתמחה בדיוק בזה."
            : "עכשיו נבדוק את יכולת ההחזר, כדי לוודא שכל תוכנית שנציע תשאיר לכם ראש שקט בסוף החודש."
        }
      />
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
      <NavRow onBack={back} onNext={() => go("credit")} />
    </section>
  );
}

export function CreditStage({ state, set, go, back }: StageProps) {
  function goToDocuments() {
    if (!state.docConfirmed) set("docBalance", Math.round(state.mortgageAmount / 1000) * 1000);
    go("documents");
  }
  const complex = isComplexCase(state);
  return (
    <section className="stage">
      <BuddyRow
        mood={complex ? "bear-detective" : "bear"}
        bubble={
          complex
            ? 'קלטתי — זה בדיוק המידע שעוזר לנו לשייך אתכם ליועץ עם ניסיון בתיקים כאלה. בלי שיפוט, רק התאמה טובה יותר. 🕵️'
            : 'כמה שאלות רכות שעוזרות לנו לשייך אתכם ליועץ עם הניסיון המתאים — אין תשובה "לא טובה" כאן.'
        }
      />
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
      <NavRow onBack={back} onNext={goToDocuments} />
    </section>
  );
}
