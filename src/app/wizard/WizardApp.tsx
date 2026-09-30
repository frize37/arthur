"use client";

import { useReducer, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./wizard.css";
import { IconSprite } from "./components/IconSprite";
import { BuddySlotContext, ProgressBar } from "./components/ui";
import { StageTip } from "./components/StageTip";
import { CHAPTERS, STAGES, STAGE_CHAPTER, initialWizardState, WizardState, type Stage } from "./lib/types";
import { wizardReducer } from "./lib/reducer";
import {
  RequestTypeStage,
  GoalStage,
  PropertyStage,
  NumbersStage,
  RepaymentStage,
  PlanningStage,
  EmploymentStage,
  CreditStage,
} from "./stages/formStages";
import { DocumentsStage } from "./stages/DocumentsStage";
import { SummaryStage } from "./stages/SummaryStage";
import { SiteFooter } from "@/components/SiteFooter";

// The heading printed at the top of each stage's sheet. Arthur's note in the
// side column explains why he asks; the heading says what is being asked.
function stageTitle(stage: Stage, state: WizardState): string {
  const isNew = state.requestType === "new";
  switch (stage) {
    case "requestType": return "מה אתם עושים היום?";
    case "goal": return isNew ? "מה המטרה ברכישה?" : "מה הכי חשוב לכם כרגע?";
    case "property": return "פרטי הנכס";
    case "numbers": return "המספרים הראשונים";
    case "repayment": return "כמה נוח לכם להחזיר בחודש?";
    case "planning": return "מה צפוי בשנים הקרובות?";
    case "employment": return "תעסוקה והכנסות";
    case "credit": return "הלוואות ואשראי";
    case "documents": return isNew ? "שתי שאלות אחרונות" : "דוח היתרות";
    case "summary": return "סיכום ושליחה";
    default: return "";
  }
}

export function WizardApp() {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState, (init) => ({ ...init, caseId: crypto.randomUUID() }));
  const [buddySlot, setBuddySlot] = useState<HTMLElement | null>(null);

  function set<K extends keyof WizardState>(field: K, value: WizardState[K]) {
    dispatch({ type: "SET", field, value });
  }
  function go(stage: (typeof STAGES)[number]) {
    dispatch({ type: "GO", stage });
  }
  function back() {
    dispatch({ type: "BACK", stages: STAGES });
  }

  const stageProps = { state, dispatch, set, go, back };
  const chapter = STAGE_CHAPTER[state.stage];
  const stepIndex = STAGES.indexOf(state.stage);

  return (
    <div className="wizard-root">
      <IconSprite />

      <header className="topbar">
        <div className="topbar__inner">
          <Link href="/" className="brand" aria-label="ארתור — עמוד הבית">
            <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={160} height={80} className="brand__wordmark" />
          </Link>
          <span className="topbar__note">בחינם · בלי התחייבות</span>
        </div>
      </header>

        <main className="wz-layout">
          <div className="wz-buddy" ref={setBuddySlot} />

          <div className="wz-main">
            <ProgressBar chapter={chapter} />
            <div className="sheet">
              <div className="sheet__head">
                <h1>{stageTitle(state.stage, state)}</h1>
                <span className="sheet__step">
                  שלב {stepIndex + 1} מתוך {STAGES.length}
                  {chapter !== undefined && <> · {CHAPTERS[chapter]}</>}
                </span>
              </div>
              <BuddySlotContext.Provider value={buddySlot}>
                {state.stage === "requestType" && <RequestTypeStage {...stageProps} />}
                {state.stage === "goal" && <GoalStage {...stageProps} />}
                {state.stage === "property" && <PropertyStage {...stageProps} />}
                {state.stage === "numbers" && <NumbersStage {...stageProps} />}
                {state.stage === "repayment" && <RepaymentStage {...stageProps} />}
                {state.stage === "planning" && <PlanningStage {...stageProps} />}
                {state.stage === "employment" && <EmploymentStage {...stageProps} />}
                {state.stage === "credit" && <CreditStage {...stageProps} />}
                {state.stage === "documents" && <DocumentsStage {...stageProps} />}
                {state.stage === "summary" && <SummaryStage {...stageProps} />}
              </BuddySlotContext.Provider>
            </div>
          </div>

          <div className="wz-tip">
            <StageTip stage={state.stage} requestType={state.requestType} />
          </div>
        </main>

      <SiteFooter />
    </div>
  );
}
