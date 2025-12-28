import { useState } from "react";
import { 
  Handshake, 
  Filter, 
  Search, 
  Eye, 
  X, 
  Star, 
  Building2, 
  MapPin, 
  DollarSign, 
  Phone, 
  Percent, 
  TrendingUp, 
  Check, 
  Clock, 
  AlertCircle, 
  MessageCircle, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  LayoutGrid,
  Columns,
  Map,
  BarChart3,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { Match, BuyerPreference, Property } from "@shared/schema";
import { MatchCardView } from "./MatchCardView";
import { MatchKanbanView } from "./MatchKanbanView";
import { MatchMapView } from "./MatchMapView";
import { MatchAnalyticsView } from "./MatchAnalyticsView";

export type MatchViewMode = "cards" | "kanban" | "map" | "analytics";

interface MatchesPageAdvancedProps {
  matches: Match[];
  isLoading?: boolean;
  onUpdateStatus?: (matchId: string, status: string) => void;
  onConvertToDeal?: (match: any) => void;
}

const statusConfig = {
  new: { label: "جديدة", color: "blue", icon: Clock },
  pending: { label: "معلقة", color: "amber", icon: Clock },
  contacted: { label: "تم التواصل", color: "emerald", icon: Phone },
  confirmed: { label: "مؤكدة", color: "emerald", icon: Check },
  viewing: { label: "معاينة", color: "blue", icon: Eye },
  agreed: { label: "متفق عليها", color: "emerald", icon: Check },
  vacated: { label: "شاغرة", color: "gray", icon: AlertCircle },
  negotiating: { label: "تفاوض", color: "amber", icon: MessageCircle },
  closed: { label: "مغلقة", color: "emerald", icon: Check },
  rejected: { label: "مرفوضة", color: "rose", icon: X },
};

const priorityConfig = {
  high: { label: "عالية", color: "rose" },
  medium: { label: "متوسطة", color: "amber" },
  low: { label: "منخفضة", color: "gray" },
};

export function MatchesPageAdvanced({ 
  matches = [], 
  isLoading = false,
  onUpdateStatus,
  onConvertToDeal 
}: MatchesPageAdvancedProps) {
  const [viewMode, setViewMode] = useState<MatchViewMode>("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score");

  // Filter matches
  const filteredMatches = matches.filter((match) => {
    const matchesSearch = 
      (match as any).property?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match as any).property?.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match as any).buyerPreference?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || match.status === filterStatus;
    const matchesPriority = filterPriority === "all" || (match as any).priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort matches
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === "score") {
      return b.matchScore - a.matchScore;
    } else if (sortBy === "date") {
      return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
    }
    return 0;
  });

  // Calculate stats
  const stats = {
    total: matches.length,
    new: matches.filter((m) => m.status === "new" || m.status === "pending").length,
    active: matches.filter((m) => ["contacted", "viewing", "negotiating"].includes(m.status)).length,
    closed: matches.filter((m) => m.status === "closed").length,
    avgScore: matches.length > 0 
      ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)
      : 0,
    avgAIPrediction: 77, // TODO: Calculate from AI predictions
    avgClosingDays: 15, // TODO: Calculate from historical data
    highPriority: matches.filter((m) => (m as any).priority === "high").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">المطابقات الذكية</h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredMatches.length} من {stats.total} مطابقة
            </p>
          </div>
        </div>

        {/* Quick Stats - 8 مؤشرات */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">إجمالي المطابقات</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">جديدة</p>
                  <p className="text-xl font-bold text-gray-900">{stats.new}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">قيد المتابعة</p>
                  <p className="text-xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">مكتملة</p>
                  <p className="text-xl font-bold text-gray-900">{stats.closed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-xs text-gray-600">متوسط التطابق</p>
                  <p className="text-xl font-bold text-gray-900">{stats.avgScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-xs text-gray-600">متوسط توقع AI</p>
                  <p className="text-xl font-bold text-gray-900">{stats.avgAIPrediction}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-600">متوسط أيام الإغلاق</p>
                  <p className="text-xl font-bold text-gray-900">{stats.avgClosingDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-600">أولوية عالية</p>
                  <p className="text-xl font-bold text-gray-900">{stats.highPriority}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في المطابقات..."
                  className="pr-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="new">جديدة</SelectItem>
                  <SelectItem value="pending">معلقة</SelectItem>
                  <SelectItem value="contacted">تم التواصل</SelectItem>
                  <SelectItem value="viewing">معاينة</SelectItem>
                  <SelectItem value="negotiating">تفاوض</SelectItem>
                  <SelectItem value="closed">مغلقة</SelectItem>
                  <SelectItem value="rejected">مرفوضة</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأولويات</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="ترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">نسبة التطابق</SelectItem>
                  <SelectItem value="date">التاريخ</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="gap-2"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">بطاقات</span>
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className="gap-2"
                >
                  <Columns className="w-4 h-4" />
                  <span className="hidden sm:inline">Kanban</span>
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className="gap-2"
                >
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">خريطة</span>
                </Button>
                <Button
                  variant={viewMode === "analytics" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("analytics")}
                  className="gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">تحليلات</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content based on view mode */}
        {viewMode === "cards" && (
          <MatchCardView 
            matches={sortedMatches}
            onUpdateStatus={onUpdateStatus}
            onConvertToDeal={onConvertToDeal}
          />
        )}

        {viewMode === "kanban" && (
          <MatchKanbanView 
            matches={sortedMatches}
            onUpdateStatus={onUpdateStatus}
            onConvertToDeal={onConvertToDeal}
          />
        )}

        {viewMode === "map" && (
          <MatchMapView 
            matches={sortedMatches}
            onUpdateStatus={onUpdateStatus}
            onConvertToDeal={onConvertToDeal}
          />
        )}

        {viewMode === "analytics" && (
          <MatchAnalyticsView 
            matches={sortedMatches}
          />
        )}
      </div>
    </div>
  );
}

