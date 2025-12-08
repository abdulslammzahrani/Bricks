import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import {
  MessageCircle,
  Send,
  ArrowRight,
  Building2,
  MapPin,
} from "lucide-react";
import type { Conversation, Message } from "@shared/schema";

interface ConversationWithDetails extends Conversation {
  property: {
    id: string;
    propertyType: string;
    city: string;
    district: string;
    price: number;
    images: string[] | null;
  } | null;
  buyer: { id: string; name: string; phone: string } | null;
  seller: { id: string; name: string; phone: string; entityName: string | null } | null;
  messages?: Message[];
}

const propertyTypeNames: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  land: "أرض",
  building: "عمارة",
  duplex: "دوبلكس",
};

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون`;
  }
  return `${(price / 1000).toFixed(0)} ألف`;
}

function formatTime(dateStr: string | Date | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString("ar-SA");
}

interface MessagingPanelProps {
  userId: string;
  userName: string;
  selectedConversationId?: string | null;
}

export function MessagingPanel({ userId, userName, selectedConversationId }: MessagingPanelProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(selectedConversationId || null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["conversations", "list", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/conversations?userId=${userId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 10000,
  });

  const { data: activeConversation, isLoading: conversationLoading } = useQuery<ConversationWithDetails | null>({
    queryKey: ["conversations", "detail", activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return null;
      const res = await fetch(`/api/conversations/${activeConversationId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!activeConversationId && !!userId,
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId: activeConversationId,
          senderId: userId,
          content,
          messageType: "text",
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["conversations", "detail", activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations", "list", userId] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", "list", userId] });
    },
  });

  useEffect(() => {
    if (activeConversationId) {
      markAsReadMutation.mutate(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  useEffect(() => {
    if (selectedConversationId) {
      setActiveConversationId(selectedConversationId);
    }
  }, [selectedConversationId]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversationId) return;
    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherParticipantName = (conv: ConversationWithDetails) => {
    if (conv.buyerId === userId) {
      return conv.seller?.entityName || conv.seller?.name || "البائع";
    }
    return conv.buyer?.name || "المشتري";
  };

  const getUnreadCount = (conv: ConversationWithDetails) => {
    if (conv.buyerId === userId) {
      return conv.buyerUnreadCount || 0;
    }
    return conv.sellerUnreadCount || 0;
  };

  if (conversationsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Only show empty state if there are no conversations AND no URL-selected conversation
  if ((!conversations || conversations.length === 0) && !selectedConversationId && !activeConversationId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-bold text-lg mb-2">لا توجد محادثات</h3>
          <p className="text-muted-foreground text-sm mb-4">
            ابدأ محادثة مع بائع من صفحة العقار
          </p>
          <Button variant="outline" asChild>
            <Link href="/">تصفح العقارات</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const conversationsList = conversations || [];

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[600px]">
      <Card className="md:col-span-1 overflow-hidden">
        <CardHeader className="pb-2 border-b">
          <h3 className="font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            المحادثات ({conversationsList.length})
          </h3>
        </CardHeader>
        <ScrollArea className="h-[520px]">
          <div className="p-2 space-y-1">
            {conversationsList.map((conv) => {
              const unread = getUnreadCount(conv);
              const isActive = activeConversationId === conv.id;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-right p-3 rounded-lg transition-colors ${
                    isActive ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                  data-testid={`conversation-item-${conv.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {conv.property?.images?.[0] ? (
                        <img 
                          src={conv.property.images[0]} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{getOtherParticipantName(conv)}</span>
                        {unread > 0 && (
                          <Badge variant="default" className="text-xs">
                            {unread}
                          </Badge>
                        )}
                      </div>
                      {conv.property && (
                        <p className="text-xs text-muted-foreground truncate">
                          {propertyTypeNames[conv.property.propertyType]} - {conv.property.district}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(conv.lastMessageAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      <Card className="md:col-span-2 flex flex-col overflow-hidden">
        {activeConversationId && activeConversation ? (
          <>
            <CardHeader className="pb-2 border-b flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden"
                    onClick={() => setActiveConversationId(null)}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <div>
                    <h3 className="font-bold">{getOtherParticipantName(activeConversation)}</h3>
                    {activeConversation.property && (
                      <Link 
                        href={`/property/${activeConversation.property.id}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3" />
                        {propertyTypeNames[activeConversation.property.propertyType]} في {activeConversation.property.district} - {formatPrice(activeConversation.property.price)} ريال
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {activeConversation.messages?.map((msg) => {
                  const isMine = msg.senderId === userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatTime(msg.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t flex-shrink-0">
              <div className="flex gap-2">
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب رسالتك..."
                  className="flex-1"
                  data-testid="input-message"
                />
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>اختر محادثة للبدء</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
