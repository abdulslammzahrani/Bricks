import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MemberLayout from "@/components/MemberLayout";
import { AppointmentsPageAdvanced } from "@/components/appointments/AppointmentsPageAdvanced";
import { useToast } from "@/hooks/use-toast";

export default function AppointmentsPage() {
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

  // Fetch appointments from API
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/appointments"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/appointments");
      if (!res.ok) {
        if (res.status === 401) {
          navigate("/");
          throw new Error("غير مصرح - يرجى تسجيل الدخول");
        }
        throw new Error("فشل في جلب المواعيد");
      }
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Update appointment status mutation
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${appointmentId}`, {
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("فشل في تحديث حالة الموعد");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة الموعد",
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

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/appointments", {
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل في إنشاء الموعد");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "تم الإنشاء بنجاح",
        description: "تم إنشاء الموعد بنجاح",
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
        <AppointmentsPageAdvanced
          appointments={appointments}
          isLoading={isLoading}
          onUpdateStatus={(appointmentId, status) => {
            updateAppointmentStatusMutation.mutate({ appointmentId, status });
          }}
          onCreateAppointment={(data) => {
            createAppointmentMutation.mutate(data);
          }}
        />
      </div>
    </MemberLayout>
  );
}


