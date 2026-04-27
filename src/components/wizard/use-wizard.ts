"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  EMPTY_WIZARD,
  STEP_FIELDS,
  STEP_KEYS,
  TOTAL_STEPS,
  type StepKey,
  type WizardData,
  wizardSchema,
} from "@/lib/wizard-schema";

const STORAGE_KEY = "portal-credito:wizard:v1";

type StoredState = {
  values: Partial<WizardData>;
  stepIndex: number;
};

function loadFromStorage(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
}

function saveToStorage(state: StoredState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota excedida o storage deshabilitado: ignoramos en silencio */
  }
}

function clearStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export type UseWizardReturn = {
  form: UseFormReturn<WizardData>;
  stepIndex: number;
  stepKey: StepKey;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  next: (extraFields?: (keyof WizardData)[]) => Promise<boolean>;
  back: () => void;
  goTo: (index: number) => void;
  reset: () => void;
  hydrated: boolean;
};

export function useWizard(): UseWizardReturn {
  const form = useForm<WizardData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: EMPTY_WIZARD as WizardData,
    mode: "onChange",
    shouldFocusError: false,
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstWrite = useRef(true);

  // Hidratación inicial desde localStorage.
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      form.reset({ ...EMPTY_WIZARD, ...stored.values } as WizardData);
      const safeIndex = Math.max(0, Math.min(stored.stepIndex, TOTAL_STEPS - 1));
      setStepIndex(safeIndex);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistencia: cualquier cambio del form o del paso activo se guarda.
  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    const subscription = form.watch((values) => {
      saveToStorage({ values: values as Partial<WizardData>, stepIndex });
    });
    saveToStorage({ values: form.getValues() as Partial<WizardData>, stepIndex });
    return () => subscription.unsubscribe();
  }, [form, stepIndex, hydrated]);

  const stepKey = STEP_KEYS[stepIndex];

  const next = async (extraFields: (keyof WizardData)[] = []) => {
    const fields = [...STEP_FIELDS[stepKey], ...extraFields];
    const ok = await form.trigger(fields, { shouldFocus: true });
    if (!ok) return false;
    if (stepIndex < TOTAL_STEPS - 1) {
      setStepIndex((i) => i + 1);
    }
    return true;
  };

  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  const goTo = (index: number) => {
    if (index < 0 || index >= TOTAL_STEPS) return;
    setStepIndex(index);
  };

  const reset = () => {
    form.reset(EMPTY_WIZARD as WizardData);
    setStepIndex(0);
    clearStorage();
  };

  return {
    form,
    stepIndex,
    stepKey,
    totalSteps: TOTAL_STEPS,
    isFirst: stepIndex === 0,
    isLast: stepIndex === TOTAL_STEPS - 1,
    next,
    back,
    goTo,
    reset,
    hydrated,
  };
}

export { STORAGE_KEY as WIZARD_STORAGE_KEY, clearStorage as clearWizardStorage };
