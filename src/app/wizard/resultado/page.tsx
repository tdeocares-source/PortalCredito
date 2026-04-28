import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ResultadoView } from "./ResultadoView";

type SearchParams = Promise<{ id?: string }>;

export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/wizard");

  const supabase = await createSupabaseServerClient();

  // RLS filtra a los informes del user actual: si el id no le pertenece,
  // .single() devuelve error y redirigimos.
  type InformeRow = {
    id: string;
    monto_uf_aprobado: number | null;
    dividenda_max: number | null;
    liquido_efectivo: number | null;
    cuota_maxima: number | null;
    tips: string[];
    score: number | null;
    solicitud_id: string;
  };
  const { data: informe, error: infErr } = (await supabase
    .from("informes")
    .select(
      "id, monto_uf_aprobado, dividenda_max, liquido_efectivo, cuota_maxima, tips, score, solicitud_id",
    )
    .eq("id", id)
    .single()) as { data: InformeRow | null; error: unknown };

  if (infErr || !informe) redirect("/wizard");

  type SolicitudRow = {
    nombre: string | null;
    correo: string | null;
    celular: string | null;
    canal_preferido: "correo" | "celular" | null;
  };
  const { data: solicitud, error: solErr } = (await supabase
    .from("solicitudes")
    .select("nombre, correo, celular, canal_preferido")
    .eq("id", informe.solicitud_id)
    .single()) as { data: SolicitudRow | null; error: unknown };

  if (solErr || !solicitud) redirect("/wizard");

  const tips = informe.tips
    .map((s: string) => safeParseTip(s))
    .filter((t: { titulo: string; detalle: string } | null): t is { titulo: string; detalle: string } => t !== null);

  const contacto =
    solicitud.canal_preferido === "correo"
      ? solicitud.correo ?? ""
      : solicitud.celular ?? "";

  return (
    <ResultadoView
      informeId={informe.id}
      nombre={solicitud.nombre ?? ""}
      contacto={contacto}
      ufAprobadas={informe.monto_uf_aprobado ?? 0}
      cuotaMaxima={informe.cuota_maxima ?? 0}
      liquidoEfectivo={informe.liquido_efectivo ?? 0}
      tips={tips}
    />
  );
}

function safeParseTip(s: string): { titulo: string; detalle: string } | null {
  try {
    const parsed = JSON.parse(s) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "titulo" in parsed &&
      "detalle" in parsed &&
      typeof (parsed as { titulo: unknown }).titulo === "string" &&
      typeof (parsed as { detalle: unknown }).detalle === "string"
    ) {
      return parsed as { titulo: string; detalle: string };
    }
    return null;
  } catch {
    return null;
  }
}
