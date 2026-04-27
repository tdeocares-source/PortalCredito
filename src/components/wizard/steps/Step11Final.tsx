"use client";

import { useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepShell } from "../StepShell";
import { formatRut } from "@/lib/chilean-rut";
import type { WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

export function Step11Final({ wizard }: StepProps) {
  const router = useRouter();
  const { register, watch, formState } = useFormContext<WizardData>();
  const canal = watch("canalPreferido");
  const otroCanal: "correo" | "celular" = canal === "correo" ? "celular" : "correo";

  const handleSubmit = async () => {
    const ok = await wizard.next([otroCanal]);
    if (ok) router.push("/wizard/resultado");
  };

  return (
    <StepShell
      title="Último paso"
      subtitle="Confirma tu RUT y un dato adicional para que podamos contactarte."
      footer={
        <Button size="lg" type="button" onClick={handleSubmit}>
          Ver mi resumen
        </Button>
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
