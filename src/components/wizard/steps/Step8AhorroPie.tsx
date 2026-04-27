"use client";

import { useFormContext } from "react-hook-form";
import { StepShell } from "../StepShell";
import { RadioCard } from "../RadioCard";
import { AHORRO_PIE_OPTIONS, type WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

export function Step8AhorroPie({ wizard }: StepProps) {
  const { setValue, watch } = useFormContext<WizardData>();
  const value = watch("ahorroPie");
  const handleSelect = (val: WizardData["ahorroPie"]) => {
    setValue("ahorroPie", val, { shouldValidate: true });
    setTimeout(() => wizard.next(), 220);
  };
  return (
    <StepShell title="¿Tienes ahorros para el pie?">
      {AHORRO_PIE_OPTIONS.map((opt) => (
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
