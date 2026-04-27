"use client";

import { useFormContext } from "react-hook-form";
import { StepShell } from "../StepShell";
import { RadioCard } from "../RadioCard";
import { PROPOSITO_OPTIONS, type WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

export function Step1Proposito({ wizard }: StepProps) {
  const { setValue, watch } = useFormContext<WizardData>();
  const value = watch("proposito");
  const handleSelect = (val: WizardData["proposito"]) => {
    setValue("proposito", val, { shouldValidate: true });
    setTimeout(() => wizard.next(), 220);
  };
  return (
    <StepShell title="¿Para qué quieres comprar?">
      {PROPOSITO_OPTIONS.map((opt) => (
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
