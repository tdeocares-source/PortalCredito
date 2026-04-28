import { LoginForm } from "./LoginForm";

type SearchParams = Promise<{ next?: string; error?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "El link no era válido. Pedí uno nuevo más abajo.",
  invalid_code: "El link expiró o ya se usó. Pedí uno nuevo más abajo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : undefined;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Ingresar al Portal
        </h1>
        <p className="text-sm text-muted-foreground">
          Te enviamos un link de acceso a tu correo. No necesitas contraseña.
        </p>
      </div>

      {errorMessage ? (
        <p className="mt-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-8">
        <LoginForm next={next} />
      </div>
    </main>
  );
}
