"use client";

import type { StepKey } from "@/lib/wizard-schema";
import type { StepProps } from "../types";
import { Step0Nombre } from "./Step0Nombre";
import { Step1Proposito } from "./Step1Proposito";
import { Step2Cuando } from "./Step2Cuando";
import { Step3Comunas } from "./Step3Comunas";
import { Step4Canal } from "./Step4Canal";
import { Step5TipoIngreso } from "./Step5TipoIngreso";
import { Step6Liquido } from "./Step6Liquido";
import { Step7Deudas } from "./Step7Deudas";
import { Step8AhorroPie } from "./Step8AhorroPie";
import { Step9MesGastosFuertes } from "./Step9MesGastosFuertes";
import { Step10PrioridadCompra } from "./Step10PrioridadCompra";
import { Step11Final } from "./Step11Final";

const REGISTRY: Record<StepKey, (props: StepProps) => React.JSX.Element> = {
  nombre: Step0Nombre,
  proposito: Step1Proposito,
  cuando: Step2Cuando,
  comunas: Step3Comunas,
  canal: Step4Canal,
  tipoIngreso: Step5TipoIngreso,
  liquido: Step6Liquido,
  deudas: Step7Deudas,
  ahorroPie: Step8AhorroPie,
  mesGastosFuertes: Step9MesGastosFuertes,
  prioridadCompra: Step10PrioridadCompra,
  final: Step11Final,
};

export function StepRouter(props: StepProps) {
  const Component = REGISTRY[props.wizard.stepKey];
  return <Component {...props} />;
}
