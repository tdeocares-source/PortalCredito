"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepShell } from "../StepShell";
import type { WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

export function Step0Nombre({ wizard }: StepProps) {
  const { register, formState } = useFormContext<WizardData>();
  return (
    <StepShell
      title="Antes de empezar, ¿cómo te llamas?"
      subtitle="Lo usaremos para personalizar tu informe."
      footer={
        <Button size="lg" type="button" onClick={() => wizard.next()}>
          Comenzar
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" autoFocus autoComplete="given-name" {...register("nombre")} />
          {formState.errors.nombre && (
            <span className="text-sm text-destructive">{formState.errors.nombre.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="apellido">Apellido</Label>
          <Input id="apellido" autoComplete="family-name" {...register("apellido")} />
          {formState.errors.apellido && (
            <span className="text-sm text-destructive">{formState.errors.apellido.message}</span>
          )}
        </div>
      </div>
    </StepShell>
  );
}
