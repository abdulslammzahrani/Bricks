import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { saudiCities } from "@shared/saudi-locations";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UnifiedLead {
  id: string;
  type: "progressive" | "property";
  name: string;
  phone: string;
  propertyId: string;
}

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: UnifiedLead | null;
  onSuccess?: () => void;
}

export default function ConvertLeadDialog({
  open,
  onOpenChange,
  lead,
  onSuccess,
}: ConvertLeadDialogProps) {
  const { toast } = useToast();
  const [city, setCity] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [propertyType, setPropertyType] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [transactionType, setTransactionType] = useState("buy");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDistricts = city
    ? saudiCities.find((c) => c.name === city)?.neighborhoods.map((n) => n.name) || []
    : [];

  const handleSubmit = async () => {
    if (!lead) return;

    if (!city || !propertyType) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال المدينة ونوع العقار على الأقل",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest(
        "POST",
        `/api/leads/${lead.type}/${lead.id}/convert`,
        {
          body: JSON.stringify({
            preferences: {
              city,
              districts: districts.length > 0 ? districts : undefined,
              propertyType,
              budgetMin: budgetMin ? parseInt(budgetMin) : undefined,
              budgetMax: budgetMax ? parseInt(budgetMax) : undefined,
              transactionType,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في التحويل");
      }

      const data = await response.json();

      toast({
        title: "تم التحويل بنجاح",
        description: "تم تحويل الليد إلى راغب وتم تشغيل نظام المطابقة",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      onSuccess?.();
      onOpenChange(false);

      // Reset form
      setCity("");
      setDistricts([]);
      setPropertyType("");
      setBudgetMin("");
      setBudgetMax("");
      setTransactionType("buy");
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء التحويل",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} dir="rtl">
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            تحويل الليد إلى راغب
          </DialogTitle>
          <DialogDescription>
            أدخل تفضيلات العميل لتحويله إلى راغب في نظام المطابقة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* City */}
          <div>
            <Label htmlFor="city">المدينة *</Label>
            <Select value={city} onValueChange={(value) => {
              setCity(value);
              setDistricts([]);
            }}>
              <SelectTrigger id="city" className="mt-2">
                <SelectValue placeholder="اختر المدينة" />
              </SelectTrigger>
              <SelectContent>
                {saudiCities.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Districts */}
          {city && availableDistricts.length > 0 && (
            <div>
              <Label>الأحياء المفضلة (اختياري)</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {availableDistricts.map((district) => (
                  <label
                    key={district}
                    className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={districts.includes(district)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDistricts([...districts, district]);
                        } else {
                          setDistricts(districts.filter((d) => d !== district));
                        }
                      }}
                      className="rounded"
                    />
                    <span>{district}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Property Type */}
          <div>
            <Label htmlFor="propertyType">نوع العقار *</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger id="propertyType" className="mt-2">
                <SelectValue placeholder="اختر نوع العقار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">شقة</SelectItem>
                <SelectItem value="villa">فيلا</SelectItem>
                <SelectItem value="land">أرض</SelectItem>
                <SelectItem value="building">عمارة</SelectItem>
                <SelectItem value="duplex">دوبلكس</SelectItem>
                <SelectItem value="floor">دور</SelectItem>
                <SelectItem value="commercial">تجاري</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Type */}
          <div>
            <Label htmlFor="transactionType">نوع المعاملة</Label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger id="transactionType" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">شراء</SelectItem>
                <SelectItem value="rent">إيجار</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budgetMin">الحد الأدنى (ر.س)</Label>
              <Input
                id="budgetMin"
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="300000"
                className="mt-2"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="budgetMax">الحد الأعلى (ر.س)</Label>
              <Input
                id="budgetMax"
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="1000000"
                className="mt-2"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !city || !propertyType}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري التحويل...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 ml-2" />
                تحويل
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


