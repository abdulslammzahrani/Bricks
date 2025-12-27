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
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ViewingBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  visitorPhone: string;
  slug: string;
  onSuccess?: () => void;
}

const timeSlots = [
  { value: "morning", label: "صباحاً (9 ص - 12 ظ)" },
  { value: "afternoon", label: "ظهراً (12 ظ - 4 م)" },
  { value: "evening", label: "مساءً (4 م - 8 م)" },
];

export default function ViewingBookingModal({
  open,
  onOpenChange,
  propertyId,
  visitorPhone,
  slug,
  onSuccess,
}: ViewingBookingModalProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get next 7 days excluding Fridays
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    let count = 0;
    let currentDate = new Date(today);

    while (dates.length < 7) {
      const dayOfWeek = currentDate.getDay();
      // Skip Fridays (5) - adjust if needed
      if (dayOfWeek !== 5) {
        dates.push(new Date(currentDate));
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار تاريخ المعاينة",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSlot) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الفترة الزمنية",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/landing-pages/${slug}/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorPhone,
          appointmentDate: selectedDate.toISOString(),
          timeSlot: selectedSlot,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في حجز المعاينة");
      }

      toast({
        title: "تم الحجز بنجاح",
        description: "سيتم التواصل معك قريباً لتأكيد الموعد",
      });

      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedSlot("");
      setNotes("");
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحجز",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            حجز معاينة العقار
          </DialogTitle>
          <DialogDescription>
            اختر التاريخ والفترة المناسبة لك لمعاينة العقار
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div>
            <Label className="mb-2 block">اختر التاريخ</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const dayOfWeek = date.getDay();
                return dayOfWeek === 5 || date < new Date(); // Disable Fridays and past dates
              }}
              className="rounded-md border"
            />
            {selectedDate && (
              <p className="text-sm text-muted-foreground mt-2">
                التاريخ المحدد: {format(selectedDate, "EEEE، d MMMM yyyy", { locale: ar })}
              </p>
            )}
          </div>

          {/* Time Slot Selection */}
          <div>
            <Label htmlFor="timeSlot" className="mb-2 block">
              <Clock className="h-4 w-4 inline ml-1" />
              الفترة الزمنية
            </Label>
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger id="timeSlot">
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي معلومات إضافية تود إضافتها..."
              rows={3}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedDate || !selectedSlot}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الحجز...
              </>
            ) : (
              "تأكيد الحجز"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


