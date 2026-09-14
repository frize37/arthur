import type { Dispatch } from "react";
import { WizardState, initialWizardState, Stage } from "./types";

export type Action =
  | { type: "SET"; field: keyof WizardState; value: WizardState[keyof WizardState] }
  | { type: "GO"; stage: Stage }
  | { type: "BACK"; stages: readonly Stage[] }
  | { type: "RESET" }
  | { type: "HYDRATE"; state: Partial<WizardState> }
  | { type: "DOC_PARSED"; balance: number }
  | { type: "DOC_SKIPPED" }
  | { type: "SUBMIT_CONTACT"; name: string; phone: string; email: string }
  | { type: "VERIFIED" }
  | { type: "CELEBRATE_SUMMARY" };

export function wizardReducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET":
      return { ...state, [action.field]: action.value };
    case "GO":
      return { ...state, stage: action.stage };
    case "BACK": {
      const i = action.stages.indexOf(state.stage);
      if (i <= 0) return state;
      return { ...state, stage: action.stages[i - 1] };
    }
    case "RESET":
      return { ...initialWizardState };
    case "HYDRATE":
      return { ...state, ...action.state };
    case "DOC_PARSED":
      return { ...state, docConfirmed: true, docSkipped: false, docParsedOnce: true, docBalance: action.balance };
    case "DOC_SKIPPED":
      return { ...state, docSkipped: true };
    case "SUBMIT_CONTACT":
      return { ...state, contactName: action.name, contactPhone: action.phone, contactEmail: action.email };
    case "VERIFIED":
      return { ...state, identityVerified: true, submitted: true };
    case "CELEBRATE_SUMMARY":
      return { ...state, celebratedSummary: true };
    default:
      return state;
  }
}

export interface StageProps {
  state: WizardState;
  dispatch: Dispatch<Action>;
  set: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void;
  go: (stage: Stage) => void;
  back: () => void;
}
