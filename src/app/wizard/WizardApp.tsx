"use client";

import { useReducer } from "react";
import Image from "next/image";
import "./wizard.css";
import { IconSprite } from "./components/IconSprite";
import { ProgressBar } from "./components/ui";
import { ArthurMascot } from "@/components/ArthurMascot";
import { STAGES, STAGE_CHAPTER, initialWizardState, WizardState } from "./lib/types";
import { wizardReducer } from "./lib/reducer";
import {
  WelcomeStage,
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

export function WizardApp() {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);

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

  return (
    <div className="wizard-root">
      <IconSprite />

      <div className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <ArthurMascot />
            <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={160} height={80} className="brand__wordmark" />
          </div>
        </div>
      </div>

      <div className="page">
        <ProgressBar chapter={chapter} />

        {state.stage === "welcome" && <WelcomeStage {...stageProps} />}
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
      </div>
    </div>
  );
}
