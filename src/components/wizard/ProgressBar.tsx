"use client";

import { Progress } from "@/components/ui/progress";

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = ((current + 1) / total) * 100;
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Paso {current + 1} de {total}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
