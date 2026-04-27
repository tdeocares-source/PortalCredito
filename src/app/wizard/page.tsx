"use client";

import { FormProvider } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { useWizard } from "@/components/wizard/use-wizard";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { StepRouter } from "@/components/wizard/steps/StepRouter";

export default function WizardPage() {
  const wizard = useWizard();

  if (!wizard.hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  return (
    <FormProvider {...wizard.form}>
      <WizardLayout
        current={wizard.stepIndex}
        total={wizard.totalSteps}
        onBack={wizard.isFirst ? undefined : wizard.back}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={wizard.stepIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <StepRouter wizard={wizard} />
          </motion.div>
        </AnimatePresence>
      </WizardLayout>
    </FormProvider>
  );
}
