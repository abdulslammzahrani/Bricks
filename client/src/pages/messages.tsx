import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MemberLayout from "@/components/MemberLayout";
import { MessagesPage } from "@/components/messages/MessagesPage";
import { useToast } from "@/hooks/use-toast";

export default function MessagesPageRoute() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get current user with proper error handling
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

  // Fetch conversations from API
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest("GET", "/api/conversations");
      if (!res.ok) {
        if (res.status === 401) {
          navigate("/");
          throw new Error("غير مصرح - يرجى تسجيل الدخول");
        }
        throw new Error("فشل في جلب المحادثات");
      }
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("فشل في إرسال الرسالة");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
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
    <MemberLayout activeTab="messages">
      <div className="min-h-screen bg-background" dir="rtl">
        <MessagesPage
          conversations={conversations}
          isLoading={isLoading}
          onSendMessage={(conversationId, content) => {
            sendMessageMutation.mutate({ conversationId, content });
          }}
        />
      </div>
    </MemberLayout>
  );
}

