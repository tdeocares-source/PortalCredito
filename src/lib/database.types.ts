/**
 * Tipos del schema `public` de Supabase. Generados manualmente para reflejar
 * la migración 00000000000001_init.sql. Cuando tengamos Supabase CLI linkeado,
 * regenerar con:
 *
 *   supabase gen types typescript --project-id uubwwalveelzfckxepug \
 *     --schema public > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SolicitudStatus = "borrador" | "enviada" | "procesada";
export type Proposito = "vivir" | "invertir" | "no_lo_tengo_claro";
export type CuandoInvertir =
  | "lo_antes_posible"
  | "0_6_meses"
  | "7_12_meses"
  | "proximo_anio";
export type TipoIngreso = "dependiente" | "independiente" | "mixto";
export type AhorroPie =
  | "no_ahorros"
  | "hasta_2m"
  | "2_a_5m"
  | "5_a_10m"
  | "10_a_20m"
  | "20_a_30m";
export type MesGastosFuertes =
  | "pido_credito"
  | "quedo_justo"
  | "tengo_ahorro"
  | "holgura";
export type PrioridadCompra =
  | "pagar_menos"
  | "equilibrio"
  | "buena_inversion"
  | "maximizar";
export type CanalContacto = "correo" | "celular";
export type AccesoEvento = "open" | "download" | "print";

// NOTA: este Database type se mantiene como referencia documental del schema
// hasta que se configure `supabase gen types` y se reemplace con el output
// auto-generado. Por incompatibilidades de inferencia con supabase-js v2.47+,
// los clientes (browser/server/admin) NO se tipan con este Database por ahora;
// las queries usan casts puntuales donde haga falta.
export type Database = {
  public: {
    Tables: {
      solicitudes: {
        Row: {
          id: string;
          user_id: string;
          status: SolicitudStatus;
          created_at: string;
          updated_at: string;
          nombre: string | null;
          apellido: string | null;
          proposito: Proposito | null;
          cuando_invertir: CuandoInvertir | null;
          comunas: string[] | null;
          canal_preferido: CanalContacto | null;
          correo: string | null;
          celular: string | null;
          tipo_ingreso: TipoIngreso | null;
          liquido_mensual: number | null;
          deudas_mensuales: number | null;
          ahorro_pie: AhorroPie | null;
          mes_gastos_fuertes: MesGastosFuertes | null;
          prioridad_compra: PrioridadCompra | null;
          rut: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: SolicitudStatus;
          created_at?: string;
          updated_at?: string;
          nombre?: string | null;
          apellido?: string | null;
          proposito?: Proposito | null;
          cuando_invertir?: CuandoInvertir | null;
          comunas?: string[] | null;
          canal_preferido?: CanalContacto | null;
          correo?: string | null;
          celular?: string | null;
          tipo_ingreso?: TipoIngreso | null;
          liquido_mensual?: number | null;
          deudas_mensuales?: number | null;
          ahorro_pie?: AhorroPie | null;
          mes_gastos_fuertes?: MesGastosFuertes | null;
          prioridad_compra?: PrioridadCompra | null;
          rut?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: SolicitudStatus;
          created_at?: string;
          updated_at?: string;
          nombre?: string | null;
          apellido?: string | null;
          proposito?: Proposito | null;
          cuando_invertir?: CuandoInvertir | null;
          comunas?: string[] | null;
          canal_preferido?: CanalContacto | null;
          correo?: string | null;
          celular?: string | null;
          tipo_ingreso?: TipoIngreso | null;
          liquido_mensual?: number | null;
          deudas_mensuales?: number | null;
          ahorro_pie?: AhorroPie | null;
          mes_gastos_fuertes?: MesGastosFuertes | null;
          prioridad_compra?: PrioridadCompra | null;
          rut?: string | null;
        };
      };
      informes: {
        Row: {
          id: string;
          solicitud_id: string;
          created_at: string;
          credibid_response: Json | null;
          score: number | null;
          monto_uf_aprobado: number | null;
          dividenda_max: number | null;
          liquido_efectivo: number | null;
          cuota_maxima: number | null;
          tips: string[];
          pdf_storage_path: string | null;
        };
        Insert: {
          id?: string;
          solicitud_id: string;
          created_at?: string;
          credibid_response?: Json | null;
          score?: number | null;
          monto_uf_aprobado?: number | null;
          dividenda_max?: number | null;
          liquido_efectivo?: number | null;
          cuota_maxima?: number | null;
          tips?: string[];
          pdf_storage_path?: string | null;
        };
        Update: {
          id?: string;
          solicitud_id?: string;
          created_at?: string;
          credibid_response?: Json | null;
          score?: number | null;
          monto_uf_aprobado?: number | null;
          dividenda_max?: number | null;
          liquido_efectivo?: number | null;
          cuota_maxima?: number | null;
          tips?: string[];
          pdf_storage_path?: string | null;
        };
      };
      accesos_informe: {
        Row: {
          id: string;
          informe_id: string;
          evento: AccesoEvento;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          informe_id: string;
          evento: AccesoEvento;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          informe_id?: string;
          evento?: AccesoEvento;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Enums: {
      solicitud_status: SolicitudStatus;
      proposito: Proposito;
      cuando_invertir: CuandoInvertir;
      tipo_ingreso: TipoIngreso;
      ahorro_pie: AhorroPie;
      mes_gastos_fuertes: MesGastosFuertes;
      prioridad_compra: PrioridadCompra;
      canal_contacto: CanalContacto;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
