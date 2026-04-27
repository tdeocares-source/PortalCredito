"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StepShell } from "../StepShell";
import { NumberInput } from "../NumberInput";
import type { WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

export function Step6Liquido({ wizard }: StepProps) {
  const { control, formState } = useFormContext<WizardData>();
  return (
    <StepShell
      title="¿Cuál es tu sueldo líquido mensual?"
      helper="Si recibes parte por boletas, esa porción se contempla al 70% al evaluar tu capacidad."
      footer={
        <Button size="lg" type="button" onClick={() => wizard.next()}>
          Continuar
        </Button>
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="liquido">Monto mensual</Label>
        <Controller
          control={control}
          name="liquidoMensual"
          render={({ field }) => (
            <NumberInput
              id="liquido"
              autoFocus
              value={field.value}
              onChange={field.onChange}
              placeholder="1.500.000"
            />
          )}
        />
        {formState.errors.liquidoMensual && (
          <span className="text-sm text-destructive">
            {formState.errors.liquidoMensual.message}
          </span>
        )}
      </div>
    </StepShell>
  );
}
