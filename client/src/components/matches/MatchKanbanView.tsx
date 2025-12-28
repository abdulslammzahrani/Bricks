import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  MapPin,
  DollarSign,
  Phone,
  MessageCircle,
  Calendar,
  Eye,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import type { Match } from "@shared/schema";

interface MatchKanbanViewProps {
  matches: Match[];
  onUpdateStatus?: (matchId: string, status: string) => void;
  onConvertToDeal?: (match: any) => void;
}

const kanbanColumns = [
  { id: "new", label: "جديدة", statuses: ["new", "pending"] },
  { id: "contacted", label: "تم التواصل", statuses: ["contacted"] },
  { id: "viewing", label: "معاينة", statuses: ["viewing"] },
  { id: "negotiating", label: "تفاوض", statuses: ["negotiating"] },
  { id: "closed", label: "مكتملة", statuses: ["closed"] },
  { id: "rejected", label: "ملغية", statuses: ["rejected"] },
];

export function MatchKanbanView({ matches, onUpdateStatus, onConvertToDeal }: MatchKanbanViewProps) {
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null);

  // Group matches by status
  const groupedMatches = kanbanColumns.map((column) => ({
    ...column,
    matches: matches.filter((match) => column.statuses.includes(match.status)),
  }));

  const handleDragStart = (match: Match) => {
    setDraggedMatch(match);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string) => {
    if (!draggedMatch) return;

    const column = kanbanColumns.find((c) => c.id === columnId);
    if (column && column.statuses.length > 0) {
      const newStatus = column.statuses[0];
      onUpdateStatus?.(draggedMatch.id, newStatus);
    }
    setDraggedMatch(null);
  };

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-bold text-lg mb-1">لا توجد مطابقات</h3>
          <p className="text-muted-foreground text-sm">
            لم يتم العثور على مطابقات بناءً على الفلاتر المحددة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" dir="rtl">
      {groupedMatches.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          <div className="bg-muted rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{column.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {column.matches.length}
              </Badge>
            </div>
          </div>
          <div className="space-y-3 min-h-[400px]">
            {column.matches.map((match) => {
              const property = (match as any).property;
              const buyerPreference = (match as any).buyerPreference;
              const priority = (match as any).priority || "medium";

              return (
                <Card
                  key={match.id}
                  draggable
                  onDragStart={() => handleDragStart(match)}
                  className="cursor-move hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    {/* Match Score */}
                    <div className="text-center mb-3">
                      <div className={`text-2xl font-bold ${
                        match.matchScore >= 90 ? "text-green-600" :
                        match.matchScore >= 75 ? "text-blue-600" :
                        match.matchScore >= 60 ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {match.matchScore}%
                      </div>
                      <Progress value={match.matchScore} className="h-1.5 mt-1" />
                    </div>

                    {/* Property Info */}
                    {property && (
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-1 text-xs">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium truncate">
                            {property.propertyType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate">
                            {property.district}, {property.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          <span className="font-bold text-emerald-600">
                            {property.price?.toLocaleString("ar-SA")} ريال
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Buyer Info */}
                    {buyerPreference && (
                      <div className="pt-2 border-t mb-3">
                        <p className="text-xs text-muted-foreground mb-1">الطلب:</p>
                        <p className="text-xs font-medium truncate">
                          {buyerPreference.city} - {buyerPreference.budgetMax?.toLocaleString("ar-SA")} ريال
                        </p>
                      </div>
                    )}

                    {/* Priority Badge */}
                    {priority === "high" && (
                      <Badge variant="destructive" className="text-xs mb-2">
                        أولوية عالية
                      </Badge>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-1 mt-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => onUpdateStatus?.(match.id, "contacted")}
                        title="تواصل"
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => onUpdateStatus?.(match.id, "viewing")}
                        title="معاينة"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      {onConvertToDeal && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => onConvertToDeal(match)}
                          title="تحويل"
                        >
                          <TrendingUp className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}


