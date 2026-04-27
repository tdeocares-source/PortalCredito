"use client";

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";

type Props = {
  current: number;
  total: number;
  onBack?: () => void;
  children: ReactNode;
};

export function WizardLayout({ current, total, onBack, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Portal Crédito
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={!onBack}
            className={cn("gap-1", !onBack && "invisible")}
            aria-label="Volver al paso anterior"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        <div className="mx-auto w-full max-w-2xl px-6 pb-4">
          <ProgressBar current={current} total={total} />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10 sm:py-14">
        {children}
      </main>
    </div>
  );
}
