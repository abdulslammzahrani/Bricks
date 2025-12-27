import { useState, useMemo } from "react";
import { useFormBuilderConfig } from "@/hooks/useFormBuilderConfig";
import DynamicFormRenderer from "./DynamicFormRenderer";
import FormNavigationButton from "./FormNavigationButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { submitForm } from "@/lib/form-submission-handler";
import type { CompleteFormConfig } from "./types";

interface FormComponentRendererProps {
  formName: string;
  theme?: "default" | "compact" | "minimal";
  layout?: "default" | "single-column" | "multi-column";
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  initialValues?: Record<string, any>;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
}

export default function FormComponentRenderer({
  formName,
  theme = "default",
  layout = "default",
  onSubmit,
  initialValues = {},
  onStepChange,
  className = "",
}: FormComponentRendererProps) {
  const { toast } = useToast();
  const { formConfig, useFormBuilder, isLoading } = useFormBuilderConfig(formName);
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form values from initialValues
  useMemo(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormValues(initialValues);
    }
  }, [initialValues]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">جاري تحميل الفورم...</div>
      </div>
    );
  }

  if (!useFormBuilder || !formConfig) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">الفورم غير موجود أو غير متاح</div>
      </div>
    );
  }

  const totalSteps = formConfig.steps.length;
  const currentStep = formConfig.steps[activeStep];
  const isLastStep = activeStep === totalSteps - 1;

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const canProceed = (): boolean => {
    if (!currentStep) return false;
    
    const requiredFields = currentStep.fields.filter((f) => f.field.required);
    for (const fieldData of requiredFields) {
      const field = fieldData.field;
      const value = formValues[field.name];
      
      if (value === undefined || value === null || value === "" || 
          (Array.isArray(value) && value.length === 0)) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast({
        title: "خطأ",
        description: "يرجى إكمال جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (isLastStep) {
      handleSubmit();
    } else {
      setActiveStep((prev) => {
        const newStep = prev + 1;
        onStepChange?.(newStep);
        return newStep;
      });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => {
        const newStep = prev - 1;
        onStepChange?.(newStep);
        return newStep;
      });
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      toast({
        title: "خطأ",
        description: "يرجى إكمال جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formValues);
      } else {
        // Use unified submission handler
        const result = await submitForm(formName, formValues, formConfig);
        
        if (!result.success) {
          throw new Error(result.error || "فشل في الإرسال");
        }

        toast({
          title: "تم الإرسال",
          description: "تم إرسال البيانات بنجاح",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الإرسال",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const themeClasses = {
    default: "bg-white",
    compact: "bg-gray-50 p-4",
    minimal: "bg-transparent",
  };

  const layoutClasses = {
    default: "max-w-2xl mx-auto",
    "single-column": "max-w-md mx-auto",
    "multi-column": "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6",
  };

  return (
    <div className={`${themeClasses[theme]} ${layoutClasses[layout]} ${className}`}>
      {theme !== "minimal" && (
        <Card>
          <CardHeader>
            <CardTitle>{formConfig.config.displayName}</CardTitle>
            {formConfig.config.description && (
              <p className="text-sm text-muted-foreground">{formConfig.config.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <DynamicFormRenderer
              formConfig={formConfig}
              values={formValues}
              onChange={handleFieldChange}
              renderFieldsOnly={true}
            />
            <div className="flex justify-between mt-6">
              <FormNavigationButton
                direction="back"
                onClick={handleBack}
                disabled={activeStep === 0}
              />
              <FormNavigationButton
                direction="next"
                onClick={handleNext}
                disabled={!canProceed()}
                isSubmitting={isSubmitting}
                isLastStep={isLastStep}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {theme === "minimal" && (
        <>
          <DynamicFormRenderer
            formConfig={formConfig}
            values={formValues}
            onChange={handleFieldChange}
            renderFieldsOnly={true}
          />
          <div className="flex justify-between mt-6">
            <FormNavigationButton
              direction="back"
              onClick={handleBack}
              disabled={activeStep === 0}
            />
            <FormNavigationButton
              direction="next"
              onClick={handleNext}
              disabled={!canProceed()}
              isSubmitting={isSubmitting}
              isLastStep={isLastStep}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Export as named export for easier imports
export { FormComponentRenderer as FormRenderer };

