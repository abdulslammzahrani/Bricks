import { Button } from "@/components/ui/button";

interface FormNavigationButtonProps {
  isLastStep: boolean;
  canProceed: boolean;
  onNext: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  nextLabel?: string;
  submitGradient?: {
    from: string;
    to: string;
    hoverFrom?: string;
    hoverTo?: string;
  };
}

/**
 * Shared component for Next/Submit button in multi-step forms
 */
export default function FormNavigationButton({
  isLastStep,
  canProceed,
  onNext,
  onSubmit,
  submitLabel = "إرسال الطلب",
  nextLabel = "التالي",
  submitGradient = {
    from: "from-emerald-600",
    to: "to-green-500",
    hoverFrom: "hover:from-emerald-700",
    hoverTo: "hover:to-green-600",
  },
}: FormNavigationButtonProps) {
  return (
    <Button
      onClick={isLastStep ? onSubmit : onNext}
      disabled={!canProceed}
      className={`w-full h-12 mt-6 rounded-xl text-lg ${
        isLastStep
          ? `bg-gradient-to-r ${submitGradient.from} ${submitGradient.to} shadow-lg text-white ${submitGradient.hoverFrom || ""} ${submitGradient.hoverTo || ""}`
          : "bg-primary hover:bg-primary/90"
      }`}
    >
      {isLastStep ? submitLabel : nextLabel}
    </Button>
  );
}



