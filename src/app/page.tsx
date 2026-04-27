import Link from "next/link";
import { ArrowRight, Clock, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Portal Crédito
          </span>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center sm:py-24">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Conoce tu capacidad de crédito hipotecario en minutos
        </h1>
        <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          Responde unas preguntas guiadas y recibí un resumen personalizado con
          el monto referencial que podrías obtener, la cuota mensual sugerida y
          recomendaciones para mejorar tu perfil crediticio.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/wizard">
            Comenzar mi consulta
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <ul className="mt-8 grid w-full gap-4 text-left sm:grid-cols-3">
          <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
            <Clock className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-foreground">Toma menos de 3 minutos</p>
            <p className="text-xs text-muted-foreground">
              12 preguntas simples sobre tu perfil financiero.
            </p>
          </li>
          <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
            <FileText className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-foreground">Resumen personalizado</p>
            <p className="text-xs text-muted-foreground">
              UF aprobadas, cuota máxima y consejos a tu medida.
            </p>
          </li>
          <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-foreground">Tus datos seguros</p>
            <p className="text-xs text-muted-foreground">
              Solo los usamos para entregarte tu informe.
            </p>
          </li>
        </ul>
      </section>
    </main>
  );
}
