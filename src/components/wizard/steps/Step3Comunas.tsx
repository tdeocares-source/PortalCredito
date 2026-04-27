"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { StepShell } from "../StepShell";
import { ComunaPicker } from "../ComunaPicker";
import type { WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

export function Step3Comunas({ wizard }: StepProps) {
  const { control, formState } = useFormContext<WizardData>();
  return (
    <StepShell
      title="¿Qué comunas te interesan?"
      subtitle="Selecciona una o varias. Si no ves la que buscas, escribila en el buscador."
      footer={
        <Button size="lg" type="button" onClick={() => wizard.next()}>
          Continuar
        </Button>
      }
    >
      <Controller
        control={control}
        name="comunas"
        render={({ field }) => (
          <ComunaPicker value={field.value || []} onChange={field.onChange} />
        )}
      />
      {formState.errors.comunas && (
        <span className="text-sm text-destructive">{formState.errors.comunas.message}</span>
      )}
    </StepShell>
  );
}
