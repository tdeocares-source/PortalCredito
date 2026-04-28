import Link from "next/link";
import { Mail } from "lucide-react";

type SearchParams = Promise<{ correo?: string }>;

export default async function SentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { correo } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Tu informe está en camino
        </h1>
        <p className="text-base text-muted-foreground">
          {correo ? (
            <>
              Te enviamos tu resumen a{" "}
              <strong className="text-foreground">{correo}</strong>. Hacé click
              en el botón del email para ver tu informe completo.
            </>
          ) : (
            <>
              Te enviamos tu resumen al correo que indicaste. Hacé click en el
              botón del email para ver tu informe completo.
            </>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          Si no lo ves en unos minutos, revisá la carpeta de spam.
        </p>
      </div>

      <div className="mt-12 border-t border-border/60 pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Ya tenés cuenta y querés ver tus informes anteriores?{" "}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
