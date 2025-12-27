import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CompleteFormConfig } from "@/components/admin/FormBuilder/types";

export function useFormConfig(formNameOrType: string) {
  return useQuery<CompleteFormConfig>({
    queryKey: ["form-config", formNameOrType],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/form-builder/${formNameOrType}`);
      return res;
    },
    enabled: !!formNameOrType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

