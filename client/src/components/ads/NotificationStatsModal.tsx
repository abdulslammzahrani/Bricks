import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, MessageCircle, TrendingUp, Calendar } from "lucide-react";

interface NotificationStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationTitle: string;
}

export function NotificationStatsModal({
  isOpen,
  onClose,
  notificationTitle,
}: NotificationStatsModalProps) {
  // Mock stats - replace with real data from API
  const stats = {
    views: 1250,
    inquiries: 87,
    conversionRate: 6.96,
    avgViewsPerDay: 45,
    peakDay: "السبت",
    topSource: "البحث المباشر",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>إحصائيات الإعلان</DialogTitle>
          <DialogDescription>{notificationTitle}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold">المشاهدات</span>
              </div>
              <p className="text-2xl font-bold">{stats.views.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">الاستفسارات</span>
              </div>
              <p className="text-2xl font-bold">{stats.inquiries}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">معدل التحويل</span>
              </div>
              <p className="text-2xl font-bold">{stats.conversionRate}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span className="font-semibold">متوسط المشاهدات/يوم</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgViewsPerDay}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">أعلى يوم:</span> {stats.peakDay}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">المصدر الرئيسي:</span> {stats.topSource}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

