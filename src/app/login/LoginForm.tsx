"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  if (state?.ok) {
    return (
      <div className="space-y-3 rounded-lg border bg-card p-6 text-card-foreground">
        <h2 className="text-lg font-medium">Revisa tu email</h2>
        <p className="text-sm text-muted-foreground">
          Enviamos un link de acceso a{" "}
          <strong className="text-foreground">{state.email}</strong>. Hacé click
          desde el mismo dispositivo para entrar.
        </p>
        <p className="text-xs text-muted-foreground">
          Si no lo ves, revisá la carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          placeholder="tu@correo.cl"
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Recibir link de acceso"}
      </Button>

      {state?.ok === false ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
