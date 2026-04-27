"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { TOP_COMUNAS, searchComunas } from "@/lib/comunas";
import { cn } from "@/lib/utils";

const MAX_SELECTIONS = 10;

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
};

export function ComunaPicker({ value, onChange }: Props) {
  const [query, setQuery] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const suggestions = React.useMemo(() => {
    if (query.trim().length < 2) return [];
    return searchComunas(query, 8).filter((c) => !value.includes(c));
  }, [query, value]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleComuna = (comuna: string) => {
    if (value.includes(comuna)) {
      onChange(value.filter((c) => c !== comuna));
    } else if (value.length < MAX_SELECTIONS) {
      onChange([...value, comuna]);
    }
  };

  const removeComuna = (comuna: string) => {
    onChange(value.filter((c) => c !== comuna));
  };

  const addFromSuggestion = (comuna: string) => {
    if (!value.includes(comuna) && value.length < MAX_SELECTIONS) {
      onChange([...value, comuna]);
    }
    setQuery("");
    setShowSuggestions(false);
  };

  const customSelections = value.filter(
    (c) => !TOP_COMUNAS.includes(c as (typeof TOP_COMUNAS)[number]),
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Más cotizadas</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TOP_COMUNAS.map((comuna) => {
            const isSelected = value.includes(comuna);
            const disabled = !isSelected && value.length >= MAX_SELECTIONS;
            return (
              <button
                key={comuna}
                type="button"
                onClick={() => toggleComuna(comuna)}
                disabled={disabled}
                aria-pressed={isSelected}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-muted-foreground/40 hover:bg-accent/40",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                {comuna}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={containerRef} className="relative">
        <p className="mb-2 text-sm font-medium text-foreground">
          ¿Otra comuna? Buscala acá
        </p>
        <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Ej: Concón, Pucón, Talca..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            disabled={value.length >= MAX_SELECTIONS}
          />
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-popover py-1 shadow-md"
          >
            {suggestions.map((comuna) => (
              <li key={comuna}>
                <button
                  type="button"
                  onClick={() => addFromSuggestion(comuna)}
                  className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {comuna}
                </button>
              </li>
            ))}
          </ul>
        )}
        {showSuggestions && query.trim().length >= 2 && suggestions.length === 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
            No encontramos esa comuna. Verificá la ortografía.
          </div>
        )}
      </div>

      {customSelections.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Otras comunas seleccionadas</p>
          <div className="flex flex-wrap gap-2">
            {customSelections.map((comuna) => (
              <span
                key={comuna}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {comuna}
                <button
                  type="button"
                  onClick={() => removeComuna(comuna)}
                  className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                  aria-label={`Quitar ${comuna}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length} de {MAX_SELECTIONS} comunas
      </p>
    </div>
  );
}
