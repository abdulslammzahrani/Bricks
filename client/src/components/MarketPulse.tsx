import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Plus, 
  CheckCircle, 
  Target, 
  Heart, 
  MessageSquare,
  Activity
} from "lucide-react";

interface PulseMetric {
  id: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface MarketPulseProps {
  activeBrowsers?: number;
  newRequests?: number;
  completedDeals?: number;
  matchedProperties?: number;
  newInterests?: number;
  ongoingChats?: number;
}

export function MarketPulse({
  activeBrowsers = 0,
  newRequests = 0,
  completedDeals = 0,
  matchedProperties = 0,
  newInterests = 0,
  ongoingChats = 0,
}: MarketPulseProps) {
  const metrics: PulseMetric[] = [
    {
      id: "active-browsers",
      label: "متصفح نشط",
      value: activeBrowsers,
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: "new-requests",
      label: "طلب جديد",
      value: newRequests,
      icon: <Plus className="h-5 w-5" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      id: "completed-deals",
      label: "صفقة مكتملة",
      value: completedDeals,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-100 dark:bg-violet-900/30",
    },
    {
      id: "matched-properties",
      label: "عقار مطابق",
      value: matchedProperties,
      icon: <Target className="h-5 w-5" />,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      id: "new-interests",
      label: "اهتمام جديد",
      value: newInterests,
      icon: <Heart className="h-5 w-5" />,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
    },
    {
      id: "ongoing-chats",
      label: "محادثة جارية",
      value: ongoingChats,
      icon: <MessageSquare className="h-5 w-5" />,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    },
  ];

  return (
    <Card className="bg-white dark:bg-slate-950 border-0 rounded-2xl overflow-hidden" data-testid="market-pulse">
      <CardContent className="p-4" dir="rtl">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative" aria-hidden="true">
            <Activity className="h-5 w-5 text-emerald-400" />
            <span className="absolute -top-1 -left-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <h3 className="font-bold text-slate-900" data-testid="market-pulse-title">نبض السوق</h3>
          <span className="text-xs text-slate-400 mr-auto" data-testid="market-pulse-status">تحديث مباشر</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((metric) => (
            <div 
              key={metric.id}
              className="flex flex-col items-center p-3 rounded-xl bg-slate-100/50 hover:bg-slate-200 transition-colors"
              data-testid={`pulse-metric-${metric.id}`}
              role="group"
              aria-label={`${metric.label}: ${metric.value}`}
            >
              <div className={`w-10 h-10 rounded-full ${metric.bgColor} flex items-center justify-center ${metric.color} mb-2`} aria-hidden="true">
                {metric.icon}
              </div>
              <span className="text-2xl font-bold text-slate-900" data-testid={`pulse-value-${metric.id}`}>{metric.value}</span>
              <span className="text-xs text-slate-400 text-center" data-testid={`pulse-label-${metric.id}`}>{metric.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketPulseCompact({
  activeBrowsers = 0,
  newRequests = 0,
  matchedProperties = 0,
}: Partial<MarketPulseProps>) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900 dark:bg-slate-950" dir="rtl" data-testid="market-pulse-compact" role="region" aria-label="مؤشرات السوق">
      <div className="flex items-center gap-2">
        <div className="relative" aria-hidden="true">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <span className="text-xs font-medium text-white" data-testid="compact-pulse-title">نبض السوق</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs" data-testid="compact-metric-browsers" aria-label={`${activeBrowsers} متصفح نشط`}>
          <Users className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
          <span className="text-white font-medium" data-testid="compact-value-browsers">{activeBrowsers}</span>
          <span className="text-slate-400">متصفح</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs" data-testid="compact-metric-requests" aria-label={`${newRequests} طلب جديد`}>
          <Plus className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          <span className="text-white font-medium" data-testid="compact-value-requests">{newRequests}</span>
          <span className="text-slate-400">طلب</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs" data-testid="compact-metric-matches" aria-label={`${matchedProperties} مطابقة`}>
          <Target className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          <span className="text-white font-medium" data-testid="compact-value-matches">{matchedProperties}</span>
          <span className="text-slate-400">مطابقة</span>
        </div>
      </div>
    </div>
  );
}
