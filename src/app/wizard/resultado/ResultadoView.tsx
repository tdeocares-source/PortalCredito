"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCLP, formatUF } from "@/lib/financial-calc";
import { clearWizardStorage } from "@/components/wizard/use-wizard";

export type ResultadoViewProps = {
  nombre: string;
  contacto: string;
  ufAprobadas: number;
  cuotaMaxima: number;
  liquidoEfectivo: number;
  tips: { titulo: string; detalle: string }[];
};

export function ResultadoView({
  nombre,
  contacto,
  ufAprobadas,
  cuotaMaxima,
  liquidoEfectivo,
  tips,
}: ResultadoViewProps) {
  const router = useRouter();

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
            Hola {nombre}, este es tu resumen
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
              {formatUF(ufAprobadas)}
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
              {formatCLP(cuotaMaxima)}
              <span className="text-base font-normal text-muted-foreground"> / mes</span>
            </p>
            <p className="text-xs text-muted-foreground">
              30% de tu ingreso efectivo ({formatCLP(liquidoEfectivo)}) menos
              tus deudas actuales.
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
            {tips.map((tip) => (
              <li
                key={tip.titulo}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="text-base font-medium text-foreground">{tip.titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tip.detalle}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Te enviamos también este resumen a{" "}
            <span className="font-medium text-foreground">{contacto}</span>.
          </p>
          <Button variant="outline" onClick={handleReset}>
            Empezar de nuevo
          </Button>
        </section>
      </main>
    </div>
  );
}
