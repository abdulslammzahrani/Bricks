import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CompleteFormConfig } from "@/components/admin/FormBuilder/types";

/**
 * Custom hook to fetch form config from Form Builder
 * @param formName - Name of the form (e.g., "buyer_form", "seller_form")
 * @returns Object containing formConfig and useFormBuilder flag
 */
export function useFormBuilderConfig(formName: string) {
  const { data: formConfig, isLoading, error } = useQuery<CompleteFormConfig | null>({
    queryKey: ["form-config", formName],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/form-builder/${formName}`);
        if (!res.ok) {
          console.log(`Form ${formName} not found (${res.status})`);
          return null;
        }
        const data = await res.json();
        console.log(`Loaded form config for ${formName}:`, data);
        // Only use Form Builder if it has steps configured
        if (data && data.steps && data.steps.length > 0) {
          console.log(`Using Form Builder for ${formName} with ${data.steps.length} steps`);
          return data;
        }
        console.log(`Form ${formName} has no steps, falling back to hardcoded form`);
        return null;
      } catch (error: any) {
        console.error(`Error loading form ${formName}:`, error);
        // Fallback to hardcoded form if Form Builder is not available
        return null;
      }
    },
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute (reduced for testing)
    refetchOnWindowFocus: true,
  });

  const useFormBuilder = !!formConfig && formConfig.steps && formConfig.steps.length > 0;

  return { formConfig, useFormBuilder, isLoading, error };
}

