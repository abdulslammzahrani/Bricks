import { useState, useEffect } from "react";
import * as React from "react";
import { MessageCircle, Send, Search, Phone, Video, MoreVertical, Paperclip, Check, CheckCheck, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sentAt: string;
  senderId: string;
  isRead: boolean;
  messageType?: "text" | "image" | "file";
}

interface Conversation {
  id: string;
  name?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
  online?: boolean;
  propertyTitle?: string;
  messages?: Message[];
  otherUserId?: string;
  buyer?: { id: string; name: string; phone: string };
  seller?: { id: string; name: string; phone: string };
  property?: { id: string; propertyType: string; city: string; district: string; price: number };
  buyerUnreadCount?: number;
  sellerUnreadCount?: number;
  lastMessageAt?: string;
}

interface MessagesPageProps {
  conversations: Conversation[];
  isLoading?: boolean;
  onSendMessage?: (conversationId: string, content: string) => void;
}

export function MessagesPage({ conversations = [], isLoading = false, onSendMessage }: MessagesPageProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");

  // Update selected conversation when conversations change
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || !onSendMessage) return;

    onSendMessage(selectedConversation.id, messageText);
    setMessageText("");
  };

  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unread || conv.buyerUnreadCount || conv.sellerUnreadCount || 0), 0);

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="bg-white rounded-lg border border-gray-200 h-[calc(100vh-180px)] flex">
          <div className="w-full md:w-96 border-l border-gray-200 p-4">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full mb-2" />
            ))}
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="h-[calc(100vh-180px)]">
        <div className="bg-white rounded-lg border border-gray-200 h-full flex overflow-hidden">
          {/* Sidebar - Conversations List */}
          <div className="w-full md:w-96 border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-emerald-600" />
                    الرسائل
                  </h2>
                  {totalUnread > 0 && (
                    <p className="text-xs text-gray-600 mt-1">{totalUnread} رسالة جديدة</p>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في المحادثات..."
                  className="pr-10"
                />
              </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-sm">لا توجد محادثات</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const displayName = conv.name || conv.buyer?.name || conv.seller?.name || "مستخدم";
                  const unreadCount = conv.unread || conv.buyerUnreadCount || conv.sellerUnreadCount || 0;
                  const propertyTitle = conv.propertyTitle || 
                    (conv.property ? `${conv.property.propertyType} - ${conv.property.city}` : "");
                  const timestamp = conv.timestamp || 
                    (conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString("ar-SA") : "");
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-right ${
                        selectedConversation?.id === conv.id ? "bg-emerald-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                              {conv.avatar ? (
                                <img src={conv.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User className="w-6 h-6" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {conv.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm text-gray-900 truncate">{displayName}</h3>
                            {timestamp && (
                              <span className="text-xs text-gray-500 flex-shrink-0 mr-2">{timestamp}</span>
                            )}
                          </div>
                          {propertyTitle && (
                            <p className="text-xs text-gray-600 truncate mb-1">{propertyTitle}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">{conv.lastMessage || ""}</p>
                            {unreadCount > 0 && (
                              <Badge variant="default" className="ml-2 flex-shrink-0">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                        {selectedConversation.avatar ? (
                          <img
                            src={selectedConversation.avatar}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.name || selectedConversation.buyer?.name || selectedConversation.seller?.name || "مستخدم"}
                      </h3>
                      {selectedConversation.online && (
                        <p className="text-xs text-green-600">متصل الآن</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                      selectedConversation.messages.map((message) => {
                        const isSent = message.senderId === (selectedConversation as any).currentUserId;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isSent
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center gap-1 mt-1 justify-end">
                                <span className="text-xs opacity-70">
                                  {new Date(message.sentAt).toLocaleTimeString("ar-SA", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {isSent && (
                                  <span className="text-xs">
                                    {message.isRead ? (
                                      <CheckCheck className="w-3 h-3 inline" />
                                    ) : (
                                      <Check className="w-3 h-3 inline" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">لا توجد رسائل بعد</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="اكتب رسالة..."
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-bold text-lg mb-1">اختر محادثة</h3>
                  <p className="text-muted-foreground text-sm">اختر محادثة من القائمة لعرض الرسائل</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

