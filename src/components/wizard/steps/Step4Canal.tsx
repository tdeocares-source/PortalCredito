"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepShell } from "../StepShell";
import { RadioCard } from "../RadioCard";
import type { WizardData } from "@/lib/wizard-schema";
import type { StepProps } from "../types";

const CANAL_OPTIONS = [
  { value: "correo" as const, label: "Por correo" },
  { value: "celular" as const, label: "Por WhatsApp" },
];

export function Step4Canal({ wizard }: StepProps) {
  const { register, watch, setValue, formState } = useFormContext<WizardData>();
  const canal = watch("canalPreferido");
  const fieldName: "correo" | "celular" = canal === "correo" ? "correo" : "celular";

  return (
    <StepShell
      title="¿Dónde te enviamos tu resultado?"
      subtitle="Elige el canal y déjanos tu dato de contacto."
      footer={
        <Button
          size="lg"
          type="button"
          onClick={() => wizard.next([fieldName])}
          disabled={!canal}
        >
          Continuar
        </Button>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {CANAL_OPTIONS.map((opt) => (
          <RadioCard
            key={opt.value}
            value={opt.value}
            label={opt.label}
            selected={canal}
            onSelect={(v) => setValue("canalPreferido", v, { shouldValidate: true })}
          />
        ))}
      </div>

      {canal === "correo" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="correo">Correo electrónico</Label>
          <Input
            id="correo"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            {...register("correo")}
          />
          {formState.errors.correo && (
            <span className="text-sm text-destructive">{formState.errors.correo.message}</span>
          )}
        </div>
      )}
      {canal === "celular" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="celular">Celular</Label>
          <Input
            id="celular"
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
