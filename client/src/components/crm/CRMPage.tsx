import { useState } from "react";
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Phone, 
  Mail, 
  MessageCircle, 
  Eye, 
  Plus, 
  Star, 
  Building2, 
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  stage: "new" | "contacted" | "qualified" | "negotiating" | "closed" | "lost";
  priority: "low" | "medium" | "high";
  interestedIn?: string;
  budget?: number;
  notes?: string;
  createdAt: string;
  lastContact?: string;
}

interface CRMPageProps {
  customers: Customer[];
  isLoading?: boolean;
  onUpdateStage?: (customerId: string, stage: string) => void;
}

const stageConfig = {
  new: { label: "جديد", color: "bg-blue-100 text-blue-700", icon: Star },
  contacted: { label: "تم التواصل", color: "bg-purple-100 text-purple-700", icon: Phone },
  qualified: { label: "مؤهل", color: "bg-indigo-100 text-indigo-700", icon: Target },
  negotiating: { label: "تفاوض", color: "bg-amber-100 text-amber-700", icon: MessageCircle },
  closed: { label: "تم الإغلاق", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  lost: { label: "خسارة", color: "bg-red-100 text-red-700", icon: X },
};

const priorityConfig = {
  low: { label: "منخفضة", color: "bg-gray-100 text-gray-700" },
  medium: { label: "متوسطة", color: "bg-amber-100 text-amber-700" },
  high: { label: "عالية", color: "bg-red-100 text-red-700" },
};

const pipelineStages = [
  { id: "new", label: "جديد", color: "bg-blue-500" },
  { id: "contacted", label: "تم التواصل", color: "bg-purple-500" },
  { id: "qualified", label: "مؤهل", color: "bg-indigo-500" },
  { id: "negotiating", label: "تفاوض", color: "bg-amber-500" },
  { id: "closed", label: "تم الإغلاق", color: "bg-green-500" },
  { id: "lost", label: "خسارة", color: "bg-red-500" },
];

export function CRMPage({ customers = [], isLoading = false, onUpdateStage }: CRMPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || customer.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const stats = {
    total: customers.length,
    new: customers.filter((c) => c.stage === "new").length,
    active: customers.filter((c) => ["contacted", "qualified", "negotiating"].includes(c.stage)).length,
    closed: customers.filter((c) => c.stage === "closed").length,
    conversionRate: customers.length > 0
      ? Math.round((customers.filter((c) => c.stage === "closed").length / customers.length) * 100)
      : 0,
  };

  // Group customers by stage
  const customersByStage = pipelineStages.map((stage) => ({
    ...stage,
    customers: filteredCustomers.filter((c) => c.stage === stage.id),
  }));

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
              <Target className="w-6 h-6 text-emerald-600" />
              إدارة علاقات العملاء (CRM)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredCustomers.length} من {stats.total} عميل
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            عميل جديد
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">إجمالي العملاء</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">جديد</p>
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
                  <p className="text-xs text-gray-600">نشط</p>
                  <p className="text-xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">مغلق</p>
                  <p className="text-xl font-bold text-gray-900">{stats.closed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في العملاء..."
                  className="pr-10"
                />
              </div>

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
            </div>
          </CardContent>
        </Card>

        {/* Sales Pipeline - Kanban View */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">مسار المبيعات</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {customersByStage.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className="bg-muted rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {stage.customers.length}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3 min-h-[400px]">
                  {stage.customers.map((customer) => {
                    const priority = priorityConfig[customer.priority];
                    return (
                      <Card key={customer.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-gray-900">{customer.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-gray-600">{customer.phone}</span>
                              </div>
                            </div>
                            <Badge className={priority.color} variant="outline">
                              {priority.label}
                            </Badge>
                          </div>

                          {customer.interestedIn && (
                            <p className="text-xs text-gray-600 mb-2">{customer.interestedIn}</p>
                          )}

                          {customer.budget && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                              <DollarSign className="w-3 h-3" />
                              <span>{customer.budget.toLocaleString("ar-SA")} ريال</span>
                            </div>
                          )}

                          {onUpdateStage && (
                            <Select
                              value={customer.stage}
                              onValueChange={(value) => onUpdateStage(customer.id, value)}
                            >
                              <SelectTrigger className="w-full mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {pipelineStages.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Phone className="w-3 h-3 mr-1" />
                              تواصل
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


