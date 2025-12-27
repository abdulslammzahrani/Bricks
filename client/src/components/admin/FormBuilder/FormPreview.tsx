import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DynamicFormRenderer from "./DynamicFormRenderer";
import type { CompleteFormConfig } from "./types";
import * as icons from "lucide-react";
import { FileText, Check, Edit2, Star } from "lucide-react";

interface FormPreviewProps {
  formConfig: CompleteFormConfig;
  selectedStepId?: string | null;
}

export default function FormPreview({ formConfig, selectedStepId }: FormPreviewProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  
  // Initialize activeStepIndex from selectedStepId or default to 0
  const getInitialIndex = () => {
    if (selectedStepId) {
      const idx = formConfig.steps.findIndex((s) => s.step.id === selectedStepId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  };
  
  const [activeStepIndex, setActiveStepIndex] = useState(getInitialIndex);
  
  // Update activeStepIndex when selectedStepId changes
  useEffect(() => {
    if (selectedStepId) {
      const idx = formConfig.steps.findIndex((s) => s.step.id === selectedStepId);
      if (idx >= 0) {
        setActiveStepIndex(idx);
      }
    } else {
      setActiveStepIndex(0);
    }
  }, [selectedStepId, formConfig.steps]);

  const handleChange = (fieldName: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Step colors - matching the real form
  const stepColors = [
    { bg: "bg-emerald-500", light: "bg-emerald-100", border: "border-emerald-200" },
    { bg: "bg-amber-500", light: "bg-amber-100", border: "border-amber-200" },
    { bg: "bg-blue-500", light: "bg-blue-100", border: "border-blue-200" },
    { bg: "bg-teal-500", light: "bg-teal-100", border: "border-teal-200" },
    { bg: "bg-purple-500", light: "bg-purple-100", border: "border-purple-200" },
    { bg: "bg-orange-500", light: "bg-orange-100", border: "border-orange-200" },
    { bg: "bg-indigo-500", light: "bg-indigo-100", border: "border-indigo-200" },
    { bg: "bg-pink-500", light: "bg-pink-100", border: "border-pink-200" },
  ];

  // Use activeStepIndex directly
  const currentActiveIndex = activeStepIndex;

  // Progress calculation
  const reliabilityScore = useMemo(() => {
    const totalSteps = formConfig.steps.length;
    if (totalSteps === 0) return 0;
    return Math.round(((currentActiveIndex + 1) / totalSteps) * 100);
  }, [currentActiveIndex, formConfig.steps.length]);

  // Empty state
  if (formConfig.steps.length === 0) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center py-12">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">لا توجد خطوات في هذا النموذج</p>
          <p className="text-sm text-muted-foreground mt-2">ابدأ بإضافة خطوة جديدة</p>
        </div>
      </div>
    );
  }

  const currentStep = formConfig.steps[currentActiveIndex];
  const isLastStep = currentActiveIndex === formConfig.steps.length - 1;

  // Single step config for renderer - ONLY the active step
  const singleStepConfig: CompleteFormConfig = currentStep ? {
    ...formConfig,
    steps: [currentStep],
  } : formConfig;

  // Header height for stacking (matching real form)
  const HEADER_HEIGHT = 50;
  const BASE_CONTENT_HEIGHT = 500;
  const containerHeight = Math.max(BASE_CONTENT_HEIGHT, (currentActiveIndex * HEADER_HEIGHT) + BASE_CONTENT_HEIGHT);

  const goBack = (index: number) => {
    setActiveStepIndex(index);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress Bar */}
      {currentActiveIndex >= 1 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {reliabilityScore < 50 ? "بداية موفقة.." : "اقتربنا من الهدف!"}
            </span>
            <span className="text-sm font-bold text-green-600">{reliabilityScore}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700" 
              style={{ width: `${reliabilityScore}%` }} 
            />
          </div>
        </div>
      )}

      {/* Stacked Cards Container */}
      <div 
        className="relative transition-all duration-500 ease-in-out" 
        style={{ height: `${containerHeight}px` }}
      >
        {/* Completed Steps Headers - Stacked on top (folded cards) */}
        {formConfig.steps.slice(0, currentActiveIndex).map((stepData, idx) => {
          const color = stepColors[idx % stepColors.length];
          const StepIcon = stepData.step.icon
            ? (icons[stepData.step.icon as keyof typeof icons] as React.ComponentType<{ className?: string }>)
            : FileText;

          return (
            <div 
              key={stepData.step.id}
              onClick={() => goBack(idx)}
              className="absolute inset-x-0 cursor-pointer hover:brightness-95 z-20"
              style={{ top: `${idx * HEADER_HEIGHT}px`, height: '60px' }}
            >
              <div className={`${color.light} rounded-t-2xl border-x-2 border-t-2 border-white/20 shadow-sm h-full flex items-center justify-between px-6`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${color.bg} text-white flex items-center justify-center`}>
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-lg">{stepData.step.title}</span>
                </div>
                <div className="flex items-center gap-1 text-primary/80 hover:text-primary transition-colors">
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-medium">تعديل</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Active Step Card - Full card with content */}
        <div 
          className="absolute inset-x-0 z-10"
          style={{ top: `${currentActiveIndex * HEADER_HEIGHT}px` }}
        >
          <div className="bg-white border shadow-xl rounded-2xl overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center justify-between p-5 border-b bg-muted/10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stepColors[currentActiveIndex % stepColors.length].light} flex items-center justify-center`}>
                  {currentStep?.step.icon ? (
                    (() => {
                      const Icon = icons[currentStep.step.icon as keyof typeof icons] as React.ComponentType<{ className?: string }>;
                      return Icon ? <Icon className="w-5 h-5 text-primary" /> : null;
                    })()
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xl">{currentStep?.step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    الخطوة {currentActiveIndex + 1} من {formConfig.steps.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Content - ONLY the active step fields */}
            <div className="p-6">
              {currentStep && (
                <>
                  <DynamicFormRenderer
                    formConfig={singleStepConfig}
                    values={values}
                    onChange={handleChange}
                    renderFieldsOnly={true}
                  />
                  
                  {/* Submit Button */}
                  <Button 
                    className={`w-full h-12 mt-6 text-lg font-semibold rounded-xl shadow-lg ${
                      isLastStep 
                        ? "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600" 
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {isLastStep ? "إرسال الطلب" : "التالي"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
