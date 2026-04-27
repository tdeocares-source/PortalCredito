"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  helper?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function StepShell({ title, subtitle, helper, children, footer }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="text-base text-muted-foreground">{subtitle}</p>}
      </header>
      {helper && (
        <div className="rounded-md border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {helper}
        </div>
      )}
      <div className="flex flex-col gap-3">{children}</div>
      {footer && <div className="mt-2 flex flex-col gap-2">{footer}</div>}
    </div>
  );
}
