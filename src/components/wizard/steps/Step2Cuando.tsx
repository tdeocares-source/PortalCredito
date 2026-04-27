"use client";

import { useFormContext } from "react-hook-form";
import { StepShell } from "../StepShell";
import { RadioCard } from "../RadioCard";
import { CUANDO_INVERTIR_OPTIONS, type WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

export function Step2Cuando({ wizard }: StepProps) {
  const { setValue, watch } = useFormContext<WizardData>();
  const value = watch("cuandoInvertir");
  const handleSelect = (val: WizardData["cuandoInvertir"]) => {
    setValue("cuandoInvertir", val, { shouldValidate: true });
    setTimeout(() => wizard.next(), 220);
  };
  return (
    <StepShell title="¿Cuándo quieres invertir?">
      {CUANDO_INVERTIR_OPTIONS.map((opt) => (
        <RadioCard
          key={opt.value}
          value={opt.value}
          label={opt.label}
          selected={value}
          onSelect={handleSelect}
        />
      ))}
    </StepShell>
  );
}
