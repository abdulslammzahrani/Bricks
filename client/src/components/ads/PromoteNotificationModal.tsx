import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PromoteNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromote: (duration: number, price: number) => void;
  notificationTitle: string;
}

export function PromoteNotificationModal({
  isOpen,
  onClose,
  onPromote,
  notificationTitle,
}: PromoteNotificationModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const [customPrice, setCustomPrice] = useState<string>("");

  const durationOptions = [
    { value: 7, label: "أسبوع واحد", price: 500 },
    { value: 14, label: "أسبوعان", price: 900 },
    { value: 30, label: "شهر واحد", price: 1500 },
    { value: 90, label: "3 أشهر", price: 4000 },
  ];

  const selectedOption = durationOptions.find(opt => opt.value === selectedDuration);
  const finalPrice = customPrice ? parseFloat(customPrice) : (selectedOption?.price || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>ترقية الإعلان</DialogTitle>
          <DialogDescription>
            اختر مدة الترقية للإعلان "{notificationTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <RadioGroup value={selectedDuration.toString()} onValueChange={(val) => setSelectedDuration(parseInt(val))}>
            {durationOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value={option.value.toString()} id={`duration-${option.value}`} />
                <Label htmlFor={`duration-${option.value}`} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    <span className="font-semibold text-emerald-600">{option.price} ريال</span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label>سعر مخصص (اختياري)</Label>
            <Input
              type="number"
              placeholder="أدخل السعر"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">المجموع:</span>
              <span className="text-xl font-bold text-emerald-600">{finalPrice} ريال</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              onPromote(selectedDuration, finalPrice);
              onClose();
            }}
          >
            تأكيد الترقية
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

