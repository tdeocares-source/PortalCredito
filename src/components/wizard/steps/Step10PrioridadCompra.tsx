"use client";

import { useFormContext } from "react-hook-form";
import { StepShell } from "../StepShell";
import { RadioCard } from "../RadioCard";
import { PRIORIDAD_COMPRA_OPTIONS, type WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

export function Step10PrioridadCompra({ wizard }: StepProps) {
  const { setValue, watch } = useFormContext<WizardData>();
  const value = watch("prioridadCompra");
  const handleSelect = (val: WizardData["prioridadCompra"]) => {
    setValue("prioridadCompra", val, { shouldValidate: true });
    setTimeout(() => wizard.next(), 220);
  };
  return (
    <StepShell title="¿Qué es lo más importante para ti en esta compra?">
      {PRIORIDAD_COMPRA_OPTIONS.map((opt) => (
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
