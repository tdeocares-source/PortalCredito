"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StepShell } from "../StepShell";
import { NumberInput } from "../NumberInput";
import type { WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

export function Step7Deudas({ wizard }: StepProps) {
  const { control, formState } = useFormContext<WizardData>();
  return (
    <StepShell
      title="¿Cuánto pagas en deudas al mes?"
      helper="Suma todas tus cuotas mensuales: créditos de consumo, tarjetas, automotriz, etc. Si no tienes deudas, escribe 0."
      footer={
        <Button size="lg" type="button" onClick={() => wizard.next()}>
          Continuar
        </Button>
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deudas">Total mensual de deudas</Label>
        <Controller
          control={control}
          name="deudasMensuales"
          render={({ field }) => (
            <NumberInput
              id="deudas"
              autoFocus
              value={field.value}
              onChange={field.onChange}
              placeholder="0"
            />
          )}
        />
        {formState.errors.deudasMensuales && (
          <span className="text-sm text-destructive">
            {formState.errors.deudasMensuales.message}
          </span>
        )}
      </div>
    </StepShell>
  );
}
