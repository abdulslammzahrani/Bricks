import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MemberLayout from "@/components/MemberLayout";
import { CRMPage } from "@/components/crm/CRMPage";
import { useToast } from "@/hooks/use-toast";

export default function CRMPageRoute() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Check authentication first
  const userQuery = useQuery<{ user?: { id: string; name: string; phone: string; email: string; role: string } }>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "فشل في جلب بيانات المستخدم");
      }
      return res.json();
    },
    retry: false,
  });

  const user = userQuery.data?.user;

  // Redirect to home if not authenticated
  useEffect(() => {
    if (userQuery.isError) {
      navigate("/");
    }
  }, [userQuery.isError, navigate]);

  // Fetch CRM data (customers/leads)
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/crm/customers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/crm/customers");
      if (!res.ok) {
        if (res.status === 401) {
          navigate("/");
          throw new Error("غير مصرح - يرجى تسجيل الدخول");
        }
        throw new Error("فشل في جلب العملاء");
      }
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Update customer stage mutation
  const updateCustomerStageMutation = useMutation({
    mutationFn: async ({ customerId, stage }: { customerId: string; stage: string }) => {
      const res = await apiRequest("PATCH", `/api/crm/customers/${customerId}`, {
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error("فشل في تحديث مرحلة العميل");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/customers"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث مرحلة العميل",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <MemberLayout>
      <div className="min-h-screen bg-background" dir="rtl">
        <CRMPage
          customers={customers}
          isLoading={isLoading}
          onUpdateStage={(customerId, stage) => {
            updateCustomerStageMutation.mutate({ customerId, stage });
          }}
        />
      </div>
    </MemberLayout>
  );
}


