"use client";

import { useEffect, useReducer, useRef, useState } from "react";
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

const STORE_KEY = "mb_wizard_v2";

export function WizardApp() {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);
  const hydratedRef = useRef(false);
  const [showSaved, setShowSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) as Partial<WizardState> });
    } catch {}
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {}
    setShowSaved(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setShowSaved(false), 1600);
  }, [state]);

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
            <span>ארתור</span>
          </div>
          <div className={"savepill" + (showSaved ? " show" : "")}>
            <svg><use href="#ic-save" /></svg>ההתקדמות נשמרה
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
