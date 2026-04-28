"use client";

import { useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepShell } from "../StepShell";
import { formatRut } from "@/lib/chilean-rut";
import { wizardSchema, type WizardData } from "@/lib/wizard-schema";
import { submitSolicitud } from "@/app/wizard/actions";
import { clearWizardStorage } from "../use-wizard";
import type { StepProps } from "../types";

export function Step11Final({ wizard }: StepProps) {
  const router = useRouter();
  const { register, watch, formState } = useFormContext<WizardData>();
  const canal = watch("canalPreferido");
  const otroCanal: "correo" | "celular" = canal === "correo" ? "celular" : "correo";
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      setError(null);
      const ok = await wizard.next([otroCanal]);
      if (!ok) return;

      // Validación final defensiva — `wizard.next` ya disparó trigger del paso,
      // pero la server action vuelve a validar el schema completo.
      const values = wizard.form.getValues();
      const parsed = wizardSchema.safeParse(values);
      if (!parsed.success) {
        setError("Faltan datos del wizard. Volvé a revisar los pasos.");
        return;
      }

      const result = await submitSolicitud(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearWizardStorage();
      router.push(`/wizard/sent?correo=${encodeURIComponent(result.correo)}`);
    });
  };

  return (
    <StepShell
      title="Último paso"
      subtitle="Confirma tu RUT y un dato adicional para que podamos contactarte."
      footer={
        <div className="flex flex-col items-end gap-2">
          {error ? (
            <span className="text-sm text-destructive">{error}</span>
          ) : null}
          <Button
            size="lg"
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Generando tu resumen..." : "Ver mi resumen"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rut">RUT</Label>
        <Input
          id="rut"
          autoComplete="off"
          placeholder="12.345.678-9"
          {...register("rut", {
            onChange: (e) => {
              e.target.value = formatRut(e.target.value);
            },
          })}
        />
        {formState.errors.rut && (
          <span className="text-sm text-destructive">{formState.errors.rut.message}</span>
        )}
      </div>

      {otroCanal === "correo" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="correo-final">Correo electrónico</Label>
          <Input
            id="correo-final"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            {...register("correo")}
          />
          {formState.errors.correo && (
            <span className="text-sm text-destructive">{formState.errors.correo.message}</span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="celular-final">Celular</Label>
          <Input
            id="celular-final"
            type="tel"
            autoComplete="tel"
            placeholder="+56 9 1234 5678"
            {...register("celular")}
          />
          {formState.errors.celular && (
            <span className="text-sm text-destructive">{formState.errors.celular.message}</span>
          )}
        </div>
      )}
    </StepShell>
  );
}
