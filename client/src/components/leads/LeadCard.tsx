import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Phone, MessageCircle, User, MapPin, Calendar, FileText, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { Property } from "@shared/schema";

interface UnifiedLead {
  id: string;
  type: "progressive" | "property";
  name: string;
  phone: string;
  email?: string;
  propertyId: string;
  property?: Property;
  sellerId?: string;
  source: string;
  status: string;
  qualityScore?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  stage?: number;
  buyerPreferenceId?: string;
  isConvertedToBuyer?: boolean;
  buyerMessage?: string;
}

interface LeadCardProps {
  lead: UnifiedLead;
  onConvert?: (lead: UnifiedLead) => void;
  onStatusUpdate?: (leadId: string, type: string, status: string) => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "جديد", color: "bg-blue-100 text-blue-700" },
  contacted: { label: "تم التواصل", color: "bg-orange-100 text-orange-700" },
  qualified: { label: "مؤهل", color: "bg-purple-100 text-purple-700" },
  negotiating: { label: "تفاوض", color: "bg-yellow-100 text-yellow-700" },
  converted: { label: "محول", color: "bg-green-100 text-green-700" },
  lost: { label: "مفقود", color: "bg-red-100 text-red-700" },
  in_progress: { label: "قيد المعالجة", color: "bg-gray-100 text-gray-700" },
};

const sourceLabels: Record<string, string> = {
  landing_page: "صفحة هبوط",
  view: "مشاهدة",
  save: "حفظ",
  contact: "تواصل",
  inquiry: "استفسار",
  call: "اتصال",
};

const propertyTypeNames: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  land: "أرض",
  building: "عمارة",
  duplex: "دوبلكس",
  floor: "دور",
  commercial: "تجاري",
};

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export default function LeadCard({ lead, onConvert, onStatusUpdate }: LeadCardProps) {
  const statusInfo = statusLabels[lead.status] || { label: lead.status, color: "bg-gray-100 text-gray-700" };
  const isConverted = lead.status === "converted" || lead.isConvertedToBuyer;

  const getWhatsAppLink = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const formatted = cleaned.startsWith("966") ? cleaned : `966${cleaned.replace(/^0/, "")}`;
    return `https://wa.me/${formatted}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{lead.name}</h3>
                  <p className="text-sm text-muted-foreground">{lead.phone}</p>
                </div>
              </div>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>

            {/* Property Info */}
            {lead.property && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {propertyTypeNames[lead.property.propertyType] || lead.property.propertyType} - {lead.property.district}، {lead.property.city}
                </span>
              </div>
            )}

            {/* Source and Date */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>المصدر: {sourceLabels[lead.source] || lead.source}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(lead.createdAt)}
              </span>
            </div>

            {/* Message if available */}
            {lead.buyerMessage && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                <FileText className="h-3 w-3 inline ml-1" />
                {lead.buyerMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
              >
                <a href={`tel:${lead.phone}`} target="_blank" rel="noopener noreferrer">
                  <Phone className="h-4 w-4" />
                  اتصال
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <a
                  href={getWhatsAppLink(lead.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  واتساب
                </a>
              </Button>
              {lead.property && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/property/${lead.propertyId}`}>
                    عرض العقار
                  </Link>
                </Button>
              )}
              {!isConverted && onConvert && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onConvert(lead)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  تحويل إلى راغب
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



