"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  prefix?: string;
};

const formatThousands = (n: number) =>
  new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(n);

export const NumberInput = React.forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, prefix = "$", className, placeholder, ...rest }, ref) => {
    const display = value === undefined || Number.isNaN(value) ? "" : formatThousands(value);
    return (
      <div
        className={cn(
          "flex h-12 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-base ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className,
        )}
      >
        <span className="text-muted-foreground" aria-hidden>
          {prefix}
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          placeholder={placeholder}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            if (digits === "") {
              onChange(undefined);
              return;
            }
            const parsed = parseInt(digits, 10);
            onChange(Number.isFinite(parsed) ? parsed : undefined);
          }}
          className="flex-1 bg-transparent py-2 outline-none placeholder:text-muted-foreground"
          {...rest}
        />
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";
