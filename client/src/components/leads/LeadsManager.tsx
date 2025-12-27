import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, Filter, Users, TrendingUp } from "lucide-react";
import LeadCard from "./LeadCard";
import ConvertLeadDialog from "./ConvertLeadDialog";
import type { UnifiedLead } from "./LeadCard";

interface LeadsManagerProps {
  sellerId?: string;
}

export default function LeadsManager({ sellerId }: LeadsManagerProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  // Build query params
  const queryParams = new URLSearchParams();
  if (sellerId) queryParams.append("sellerId", sellerId);
  if (statusFilter !== "all") queryParams.append("status", statusFilter);
  if (sourceFilter !== "all") queryParams.append("source", sourceFilter);

  const { data: leads = [], isLoading } = useQuery<UnifiedLead[]>({
    queryKey: ["/api/leads", sellerId, statusFilter, sourceFilter],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/leads?${queryParams.toString()}`);
      return await res.json();
    },
  });

  // Filter by search query
  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.phone.includes(query) ||
      lead.property?.district?.toLowerCase().includes(query) ||
      lead.property?.city?.toLowerCase().includes(query)
    );
  });

  // Calculate statistics
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted: leads.filter((l) => l.status === "converted" || l.isConvertedToBuyer).length,
  };

  const handleConvert = (lead: UnifiedLead) => {
    setSelectedLead(lead);
    setShowConvertDialog(true);
  };

  const handleConvertSuccess = () => {
    setSelectedLead(null);
    setShowConvertDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الليدز</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">جديدة</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <Badge variant="outline" className="bg-blue-50">جديد</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تم التواصل</p>
                <p className="text-2xl font-bold text-orange-600">{stats.contacted}</p>
              </div>
              <Badge variant="outline" className="bg-orange-50">تواصل</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">محولة</p>
                <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الليدز</CardTitle>
          <CardDescription>
            إدارة العملاء المحتملين وتحويلهم إلى راغبين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم، الجوال، أو الموقع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                dir="rtl"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="حالة الليد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="contacted">تم التواصل</SelectItem>
                <SelectItem value="qualified">مؤهل</SelectItem>
                <SelectItem value="negotiating">تفاوض</SelectItem>
                <SelectItem value="converted">محول</SelectItem>
                <SelectItem value="lost">مفقود</SelectItem>
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="المصدر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المصادر</SelectItem>
                <SelectItem value="landing_page">صفحة هبوط</SelectItem>
                <SelectItem value="view">مشاهدة</SelectItem>
                <SelectItem value="save">حفظ</SelectItem>
                <SelectItem value="contact">تواصل</SelectItem>
                <SelectItem value="inquiry">استفسار</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد ليدز</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLeads.map((lead) => (
                <LeadCard
                  key={`${lead.type}-${lead.id}`}
                  lead={lead}
                  onConvert={handleConvert}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convert Dialog */}
      <ConvertLeadDialog
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
        lead={selectedLead}
        onSuccess={handleConvertSuccess}
      />
    </div>
  );
}


