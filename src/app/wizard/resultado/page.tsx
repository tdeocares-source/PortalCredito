"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcularResumen, formatCLP, formatUF } from "@/lib/financial-calc";
import { generarConsejos } from "@/lib/consejos";
import { wizardSchema, type WizardData } from "@/lib/wizard-schema";
import {
  WIZARD_STORAGE_KEY,
  clearWizardStorage,
} from "@/components/wizard/use-wizard";

type StoredState = { values: unknown };

export default function ResultadoPage() {
  const router = useRouter();
  const [data, setData] = useState<WizardData | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY);
      if (!raw) {
        router.replace("/wizard");
        return;
      }
      const stored = JSON.parse(raw) as StoredState;
      const parsed = wizardSchema.safeParse(stored.values);
      if (!parsed.success) {
        router.replace("/wizard");
        return;
      }
      setData(parsed.data);
    } catch {
      router.replace("/wizard");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Generando tu resumen...</span>
      </div>
    );
  }

  const resumen = calcularResumen({
    liquidoBruto: data.liquidoMensual,
    tipoIngreso: data.tipoIngreso,
    deudasMensuales: data.deudasMensuales,
  });

  const consejos = generarConsejos({
    liquidoEfectivo: resumen.liquidoEfectivo,
    deudasMensuales: data.deudasMensuales,
    tipoIngreso: data.tipoIngreso,
    ahorroPie: data.ahorroPie,
    mesGastosFuertes: data.mesGastosFuertes,
  });

  const handleReset = () => {
    clearWizardStorage();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto w-full max-w-3xl px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Portal Crédito
          </span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10 sm:py-14">
        <section className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resumen preliminar
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Hola {data.nombre}, este es tu resumen
          </h1>
          <p className="text-base text-muted-foreground">
            Es una estimación basada en las respuestas que nos diste. Pronto
            integraremos información de bancos para entregarte un cálculo final.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Te podrían prestar hasta
            </span>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {formatUF(resumen.ufAprobadas)}
            </p>
            <p className="text-xs text-muted-foreground">
              Estimación referencial. El monto final lo entrega cada banco según
              su evaluación crediticia.
            </p>
          </article>

          <article className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Wallet className="h-4 w-4 text-primary" />
              Cuota máxima sugerida
            </span>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {formatCLP(resumen.cuotaMaxima)}
              <span className="text-base font-normal text-muted-foreground"> / mes</span>
            </p>
            <p className="text-xs text-muted-foreground">
              30% de tu ingreso efectivo ({formatCLP(resumen.liquidoEfectivo)})
              menos tus deudas actuales.
            </p>
          </article>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Cómo mejorar tu perfil crediticio
            </h2>
          </div>
          <ul className="flex flex-col gap-3">
            {consejos.map((consejo) => (
              <li
                key={consejo.titulo}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="text-base font-medium text-foreground">{consejo.titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{consejo.detalle}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Te enviaremos también este resumen a{" "}
            <span className="font-medium text-foreground">
              {data.canalPreferido === "correo" ? data.correo : data.celular}
            </span>
            .
          </p>
          <Button variant="outline" onClick={handleReset}>
            Empezar de nuevo
          </Button>
        </section>
      </main>
    </div>
  );
}
