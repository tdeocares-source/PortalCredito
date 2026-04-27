"use client";

import { useFormContext } from "react-hook-form";
import { StepShell } from "../StepShell";
import { RadioCard } from "../RadioCard";
import { MES_GASTOS_FUERTES_OPTIONS, type WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

export function Step9MesGastosFuertes({ wizard }: StepProps) {
  const { setValue, watch } = useFormContext<WizardData>();
  const value = watch("mesGastosFuertes");
  const handleSelect = (val: WizardData["mesGastosFuertes"]) => {
    setValue("mesGastosFuertes", val, { shouldValidate: true });
    setTimeout(() => wizard.next(), 220);
  };
  return (
    <StepShell title="¿Qué harías frente a un mes de gastos fuertes?">
      {MES_GASTOS_FUERTES_OPTIONS.map((opt) => (
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
