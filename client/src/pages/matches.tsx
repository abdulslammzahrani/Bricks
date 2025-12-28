import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MemberLayout from "@/components/MemberLayout";
import { MatchesPageAdvanced } from "@/components/matches/MatchesPageAdvanced";
import { useToast } from "@/hooks/use-toast";

export default function MatchesPage() {
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

  // Fetch matches from API
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/matches"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/matches");
      if (!res.ok) {
        if (res.status === 401) {
          navigate("/");
          throw new Error("غير مصرح - يرجى تسجيل الدخول");
        }
        throw new Error("فشل في جلب المطابقات");
      }
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Update match status mutation
  const updateMatchStatusMutation = useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/matches/${matchId}`, {
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("فشل في تحديث حالة المطابقة");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة المطابقة",
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

  const handleConvertToDeal = (match: any) => {
    // Navigate to deals page or show dialog
    toast({
      title: "تحويل إلى صفقة",
      description: "سيتم تحويل المطابقة إلى صفقة",
    });
  };

  return (
    <MemberLayout activeTab="matches">
      <div className="min-h-screen bg-background" dir="rtl">
        <MatchesPageAdvanced
          matches={matches}
          isLoading={isLoading}
          onUpdateStatus={(matchId, status) => {
            updateMatchStatusMutation.mutate({ matchId, status });
          }}
          onConvertToDeal={handleConvertToDeal}
        />
      </div>
    </MemberLayout>
  );
}

