import Link from "next/link";
import Image from "next/image";
import { fetchPublicStats } from "./lib/publicStats";
import { fetchPublicAdvisors } from "./lib/publicAdvisors";
import { AdvisorRoster } from "@/components/AdvisorRoster";
import { SiteFooter } from "@/components/SiteFooter";
import { shekel } from "./wizard/lib/finance";
import "./landing.css";

// Stats are live data, not build-time content — refresh at most once a
// minute instead of baking in whatever the counts were at deploy time.
export const revalidate = 60;

// Each step is one divider tab in the folder, in the tab's own color.
const STEPS = [
  {
    color: "var(--accent)",
    title: "עונים על שאלון קצר",
    desc: "כ-2 דקות, מסך אחד-שניים לכל נושא. כל שאלה חשובה לדיוק ההצעה שתקבלו.",
  },
  {
    color: "var(--hoodie)",
    title: "מעלים דוח יתרות",
    desc: "או ממלאים את פרטי הריבית בעצמכם — כך או כך, המספרים האלה הם הבסיס להצעה האמיתית.",
  },
  {
    color: "var(--surface-2)",
    title: "מאמתים זהות בקצרה",
    desc: "קוד חד-פעמי במייל, כדי שהתיק ייפתח בביטחון מלא.",
  },
  {
    color: "var(--pop-warm)",
    title: "יועצים מתחרים על התיק שלכם",
    desc: "התיק יוצא למספר יועצי משכנתאות, וכל אחד מגיש הצעת מחיר אמיתית — אתם מקבלים את המשתלמת ביותר.",
  },
];

const PROMISES = [
  {
    title: "יש לכם עם מי לדבר",
    desc: "יועץ משכנתאות בשר ודם מקבל את התיק שלכם, מדבר איתכם ומלווה אתכם עד הסוף. לא צ׳אט, לא טופס שחוזר במייל, ולא מחשב שמחליט במקומכם.",
  },
  {
    title: "הם מתחרים עליכם",
    desc: "זה כל ההבדל: במקום שתלכו ליועץ אחד ותקוו שהוא הכי טוב, כמה יועצים מקבלים את התיק באותו זמן ומתחרים עליו. התוצאה היא תנאים טובים יותר עבורכם.",
  },
  {
    title: "ורק הטובים שבהם",
    desc: "עובדים איתנו מטובי יועצי המשכנתאות בארץ. כל יועץ נמדד על החיסכון שהשיג ועל השירות שנתן — ומי שלא עומד בזה, לא ממשיך.",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "מה זה בעצם ארתור?",
    a: "ארתור היא מערכת שפותחה על ידי אנשים שראו צורך לבדוק כל הלוואה או משכנתה מול כמה מומחים בו-זמנית — האם יש בכלל היתכנות למיחזור, וכמה זה יעלה לבצע בפועל.",
  },
  {
    q: "למה לא לבדוק ישר מול הבנק שלי?",
    a: "כי הבנק מחפש את הפתרון הכי טוב עבורו. אנחנו בצד השני — יחד עם יועצי המשכנתאות — לטובת הלקוח, ומשווים מי מציע את הפתרון הטוב ביותר במחיר הכי משתלם והאפשרי.",
  },
  {
    q: "האם אני צריך להעביר לכם פרטים אישיים?",
    a: "אתם מעלים דוח יתרות שמופיעים בו פרטי המשכנתה בלבד. אנחנו לא שומרים את הדוח עצמו אצלנו — רק שולפים ממנו את הנתונים הפיננסיים, בלי שום פרט מזהה, ומעבירים אותם ליועצים. פרטי הקשר שלכם (שם, טלפון, מייל) נחשפים רק ליועץ שנבחר, ורק אחרי שתאשרו.",
  },
  {
    q: "כמה זמן זה לוקח?",
    a: "מילוי השאלון עצמו לוקח כ-2 דקות. מיד אחרי זה התיק עובר ליועצים ואתם מקבלים תשובה מהר — היועצים אצלנו נמדדים על חיסכון, יעילות, שירות, ומהירות שליחת הצעת המחיר.",
  },
  {
    q: "האם הבדיקה עולה כסף, ואני מחויב/ת לקחת את ההצעה?",
    a: "הבדיקה, ההשוואה וההצעה — הכל חינמי וללא כל התחייבות מצידכם.",
  },
  {
    q: "מה אם עדיין אין לי את דוח היתרות?",
    a: "אפשר להמשיך גם בלעדיו — תמלאו בעצמכם את פרטי הריבית, היתרה והתקופה. שימו לב שההצעה שתתקבל תהיה מבוססת על הנתונים שהצהרתם, ולכן כדאי שיהיו מדויקים ככל האפשר.",
  },
  {
    q: "איך בוחרים את היועצים, ומה קורה עם ההצעות שלהם?",
    a: "היועצים נבחרים לפי סוג התיק שלכם (מיחזור, עצמאים, מסלולים משתנים ועוד). כל אחד מגיש הצעת מחיר, ואנחנו משווים ומעבירים אליכם רק את ההצעה המשתלמת ביותר.",
  },
  {
    q: "מה קורה אם יועץ לא נותן שירות טוב?",
    a: "בסוף התהליך אתם מדרגים את היועץ שטיפל בכם. אנחנו כאן כדי לשרת אתכם — יועץ שמקבל דירוגים נמוכים לא ממשיך לעבוד איתנו.",
  },
  {
    q: "יש לי כבר משכנתה תקינה, יש בכלל טעם לבדוק?",
    a: "כן — ריביות משתנות עם הזמן, ולעיתים קרובות אפשר לחסוך עשרות אלפי שקלים גם במשכנתה \"בסדר\", בלי לשנות כלום מלבד התנאים.",
  },
  {
    q: "איך יוצרים איתי קשר בהמשך?",
    a: "אחרי שתאשרו את ההצעה הנבחרת, היועץ יוצר איתכם קשר ישירות, בטווח השעות שבחרתם באשף.",
  },
];

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export default async function Home() {
  const [stats, advisors] = await Promise.all([fetchPublicStats(), fetchPublicAdvisors()]);
  const ledger = [
    { label: "תיקים שבדקנו", value: stats.casesChecked.toLocaleString("he-IL") },
    { label: "תיקים שנסגרו בהצלחה", value: stats.casesClosed.toLocaleString("he-IL") },
    { label: "חיסכון שסיפקנו ללקוחות", value: shekel(stats.totalSavings) },
    { label: "היקף משכנתאות שבדקנו", value: shekel(stats.totalMortgageVolume) },
  ];

  return (
    <div className="cf flex flex-col min-h-full">
      <header className="cf-header">
        <div className="cf-wrap">
          <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={280} height={140} className="cf-header__logo" priority />
          <nav className="cf-nav" aria-label="ניווט ראשי">
            <a href="#how">איך זה עובד</a>
            <a href="#advisors">היועצים</a>
            <a href="#faq">שאלות</a>
            <a href="#join" className="cf-nav__join">יועצים? הצטרפו</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* THE OPEN CASE FILE */}
        <div className="cf-wrap">
          <div className="cf-folder">
            <section className="cf-panel cf-cover" aria-labelledby="hero-title">
              <div className="cf-label">
                <h1 id="hero-title" className="cf-h1">
                  אל תיקחו משכנתה לפני ש<mark>ארתור בודק</mark>.
                </h1>
                <p className="cf-lede">
                  כמה שאלות פשוטות, דוח יתרות אחד — ותוך זמן קצר כמה יועצי משכנתאות מתחרים על התיק שלכם ומציעים לכם את התנאים הכי טובים שהם יכולים.
                </p>
                <div className="cf-actions">
                  <Link href="/wizard" className="cf-cta">
                    לפתוח תיק בחינם
                    <Arrow />
                  </Link>
                  <div className="cf-trust">
                    <span><Check />בחינם</span>
                    <span><Check />בלי התחייבות</span>
                  </div>
                </div>
              </div>
            </section>

            <Image
              src="/brand/arthur-bear-full.png"
              alt="ארתור הדובי בודק את התיק עם זכוכית מגדלת"
              width={600}
              height={600}
              className="cf-bear"
              priority
            />

            <section className="cf-panel cf-back" aria-label="הדגמה: כך נראה תיק שיוצא ליועצים">
              <nav className="cf-tabs" aria-label="קפיצה לחלקי הדף">
                <a href="#how">איך זה עובד</a>
                <a href="#advisors">היועצים</a>
                <a href="#faq">שאלות</a>
                <a href="#join">ליועצים</a>
              </nav>
              <div className="cf-sheet">
                <div className="cf-sheet__head">
                  <strong>תיק משכנתה</strong>
                  <span>דוגמה</span>
                </div>
                <dl className="cf-fields">
                  <div className="cf-field"><dt>סוג</dt><dd>מיחזור משכנתה קיימת</dd></div>
                  <div className="cf-field"><dt>יתרה</dt><dd>{shekel(1140000)} · 3 מסלולים</dd></div>
                  <div className="cf-field">
                    <dt>שם וטלפון</dt>
                    <dd className="cf-redacted"><i aria-hidden /><small>רק היועץ שתבחרו יראה</small></dd>
                  </div>
                </dl>
                <div className="cf-routing">
                  <span>התיק יצא ל-4 יועצים · 3 הצעות התקבלו</span>
                  <span className="cf-dots" aria-hidden><i /><i /><i /><i /></span>
                </div>
                <div className="cf-slips">
                  <div className="cf-slip">
                    <span className="cf-slip__clip" aria-hidden />
                    <b>יועצת א׳</b>
                    <strong>{shekel(94300)}</strong>
                    <small>חיסכון משוער</small>
                  </div>
                  <div className="cf-slip">
                    <b>יועץ ב׳</b>
                    <strong>{shekel(81900)}</strong>
                    <small>חיסכון משוער</small>
                  </div>
                  <div className="cf-slip cf-slip--best">
                    <b>יועץ ג׳ <span className="cf-flag">המשתלמת</span></b>
                    <strong>{shekel(112600)}</strong>
                    <small>חיסכון משוער</small>
                  </div>
                </div>
                <div className="cf-stamp" aria-hidden>נבדק<small>ע״י ארתור</small></div>
                <p className="cf-demo">נתוני הדגמה בלבד</p>
              </div>
            </section>
          </div>
        </div>

        {/* THE REGISTER — live numbers */}
        <section className="cf-section" aria-labelledby="ledger-title">
          <div className="cf-wrap">
            <div className="cf-ledger">
              <div className="cf-ledger__head">
                <strong id="ledger-title">הרישום של ארתור</strong>
                <span>מתעדכן באופן שוטף</span>
              </div>
              <dl className="cf-ledger__rows">
                {ledger.map((row) => (
                  <div key={row.label} className="cf-ledger__row">
                    <dt>{row.label}</dt>
                    <span className="cf-leader" aria-hidden />
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ARTHUR'S MEMO — human, not digital */}
        <section className="cf-section" style={{ paddingTop: 0 }} aria-labelledby="memo-title">
          <div className="cf-wrap cf-memo">
            <div>
              <h2 id="memo-title" className="cf-h2">אנחנו לא ייעוץ משכנתאות דיגיטלי</h2>
              <p className="cf-sub">ארתור לא מחשב לכם משכנתה ושולח אותה במייל. ארתור מביא לכם בן אדם.</p>
            </div>
            <article className="cf-memo__sheet">
              <dl className="cf-memo__meta">
                <dt>אל</dt><dd>מי שיש לו משכנתה</dd>
                <dt>מאת</dt><dd>ארתור</dd>
                <dt>בנושא</dt><dd>מה מקבלים כשפותחים תיק</dd>
              </dl>
              {PROMISES.map((p) => (
                <div key={p.title} className="cf-point">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
              <div className="cf-sign">
                <span>בחינם, ובלי שום התחייבות.</span>
                <span className="cf-stamp-static" aria-hidden>ארתור</span>
              </div>
            </article>
          </div>
        </section>

        {/* WHO IS COMPETING */}
        <AdvisorRoster advisors={advisors} />

        {/* HOW IT WORKS — divider tabs */}
        <section id="how" className="cf-section" aria-labelledby="how-title">
          <div className="cf-wrap">
            <h2 id="how-title" className="cf-h2">איך זה עובד, מהתחלה ועד ההצעה</h2>
            <ol className="cf-stack">
              {STEPS.map((step, i) => (
                <li key={step.title} className="cf-stack__sheet" style={{ ["--i" as string]: i, ["--t" as string]: step.color }}>
                  <h3 className="cf-stack__tab"><span>{i + 1}</span>{step.title}</h3>
                  <p>{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="cf-section" style={{ paddingTop: 0 }} aria-labelledby="faq-title">
          <div className="cf-wrap" style={{ maxWidth: 960 }}>
            <h2 id="faq-title" className="cf-h2">10 שאלות שכולם שואלים אותנו</h2>
            <div className="cf-faq">
              {FAQ.map((item) => (
                <details key={item.q}>
                  <summary>
                    {item.q}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FOR ADVISORS */}
        <section id="join" className="cf-section" style={{ paddingTop: 0 }} aria-labelledby="join-title">
          <div className="cf-wrap">
            <div className="cf-join">
              <div>
                <h2 id="join-title" className="cf-h2">יועצי משכנתאות? התיקים מגיעים אליכם</h2>
                <p className="cf-sub">ארתור מכין את התיק: שאלון מלא, נתוני דוח היתרות ופרטי המסלולים, בלי פרט מזהה. אתם מגישים הצעה, והלקוח בוחר.</p>
                <div className="cf-actions">
                  <Link href="/login" className="cf-cta cf-cta--yellow">כניסה ליועצים</Link>
                </div>
              </div>
              <ul className="cf-join__list">
                <li className="cf-join__item"><Check /><span><b>תיקים לפי ההתמחות שלכם.</b> מיחזור, עצמאים, מסלולים משתנים ועוד.</span></li>
                <li className="cf-join__item"><Check /><span><b>תיק מסודר מהרגע הראשון.</b> הנתונים הפיננסיים כבר שם, בלי לרדוף אחרי מסמכים.</span></li>
                <li className="cf-join__item"><Check /><span><b>נמדדים על מה שחשוב.</b> חיסכון, שירות ומהירות הגשת ההצעה.</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* CLOSE */}
        <section className="cf-section" style={{ paddingTop: 0 }} aria-labelledby="close-title">
          <div className="cf-wrap cf-close">
            <Image src="/brand/arthur-bear-full.png" alt="" width={440} height={440} className="cf-close__bear" />
            <div>
              <h2 id="close-title" className="cf-h2">מוכנים לדעת בדיוק איפה אתם עומדים?</h2>
              <p className="cf-sub">2 דקות, בלי התחייבות, ובלי עלות. ארתור כבר בודק.</p>
              <div className="cf-actions">
                <Link href="/wizard" className="cf-cta cf-cta--yellow">
                  לפתוח תיק בחינם
                  <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
