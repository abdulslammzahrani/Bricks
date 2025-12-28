import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Building2, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Eye, 
  Edit, 
  Users, 
  Bell, 
  CalendarCheck, 
  CalendarX,
  Timer,
  List,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Appointment } from "@shared/schema";

interface AppointmentsPageAdvancedProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onUpdateStatus?: (appointmentId: string, status: string) => void;
  onCreateAppointment?: (data: any) => void;
}

const statusConfig = {
  scheduled: { label: "مجدولة", color: "bg-blue-100 text-blue-700", icon: CalendarIcon },
  confirmed: { label: "مؤكدة", color: "bg-indigo-100 text-indigo-700", icon: CalendarCheck },
  completed: { label: "مكتملة", color: "bg-green-100 text-green-700", icon: Check },
  cancelled: { label: "ملغية", color: "bg-red-100 text-red-700", icon: X },
  pending: { label: "معلقة", color: "bg-amber-100 text-amber-700", icon: Clock },
};

export function AppointmentsPageAdvanced({ 
  appointments = [], 
  isLoading = false,
  onUpdateStatus,
  onCreateAppointment 
}: AppointmentsPageAdvancedProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const filteredAppointments = appointments.filter((apt) => {
    const statusMatch = filterStatus === "all" || apt.status === filterStatus;
    return statusMatch;
  });

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter((a) => a.status === "scheduled" || a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-emerald-600" />
              جدول المواعيد
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredAppointments.length} من {stats.total} موعد
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            موعد جديد
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">إجمالي المواعيد</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">مجدولة</p>
                  <p className="text-xl font-bold text-gray-900">{stats.scheduled}</p>
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
                  <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-600">ملغية</p>
                  <p className="text-xl font-bold text-gray-900">{stats.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="scheduled">مجدولة</SelectItem>
                  <SelectItem value="confirmed">مؤكدة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغية</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">تقويم</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">قائمة</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content based on view mode */}
        {viewMode === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>التقويم</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  مواعيد {selectedDate.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAppointments
                  .filter((apt) => {
                    const aptDate = new Date(apt.appointmentDate);
                    return aptDate.toDateString() === selectedDate.toDateString();
                  })
                  .length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-sm">لا توجد مواعيد في هذا اليوم</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments
                      .filter((apt) => {
                        const aptDate = new Date(apt.appointmentDate);
                        return aptDate.toDateString() === selectedDate.toDateString();
                      })
                      .map((apt) => {
                        const status = statusConfig[apt.status as keyof typeof statusConfig] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        return (
                          <Card key={apt.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={status.color}>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {status.label}
                                    </Badge>
                                    <span className="text-sm font-medium text-gray-900">
                                      {new Date(apt.appointmentDate).toLocaleTimeString("ar-SA", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <p className="font-semibold text-gray-900 mb-1">موعد معاينة</p>
                                  {apt.notes && (
                                    <p className="text-sm text-gray-600">{apt.notes}</p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedAppointment(apt);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-sm">لا توجد مواعيد</p>
                  </div>
                ) : (
                  filteredAppointments.map((apt) => {
                    const status = statusConfig[apt.status as keyof typeof statusConfig] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    return (
                      <Card key={apt.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={status.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.label}
                                </Badge>
                                <span className="text-sm font-medium text-gray-900">
                                  {new Date(apt.appointmentDate).toLocaleDateString("ar-SA", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {new Date(apt.appointmentDate).toLocaleTimeString("ar-SA", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              {apt.notes && (
                                <p className="text-sm text-gray-600 mb-2">{apt.notes}</p>
                              )}
                              {apt.location && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>{apt.location}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAppointment(apt);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                عرض
                              </Button>
                              {onUpdateStatus && (
                                <Select
                                  value={apt.status}
                                  onValueChange={(value) => onUpdateStatus(apt.id, value)}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="scheduled">مجدولة</SelectItem>
                                    <SelectItem value="confirmed">مؤكدة</SelectItem>
                                    <SelectItem value="completed">مكتملة</SelectItem>
                                    <SelectItem value="cancelled">ملغية</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


