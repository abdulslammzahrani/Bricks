import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, Building2, TrendingUp } from "lucide-react";
import type { Notification } from "./NotificationCard";

interface AddNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (notification: Notification) => void;
}

export function AddNotificationModal({ isOpen, onClose, onAdd }: AddNotificationModalProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<{
    type: 'offer' | 'request';
    listingType: 'sale' | 'rent' | 'investment';
  } | null>(null);

  const handleSelect = (type: 'offer' | 'request', listingType: 'sale' | 'rent' | 'investment') => {
    setSelectedType({ type, listingType });
  };

  const handleContinue = () => {
    if (!selectedType) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار نوع الإعلان",
        variant: "destructive",
      });
      return;
    }

    // Navigate to appropriate form
    if (selectedType.type === 'offer' && selectedType.listingType === 'sale') {
      navigate("/seller-form?type=seller");
    } else if (selectedType.type === 'offer' && selectedType.listingType === 'rent') {
      navigate("/seller-form?type=seller&rent=true");
    } else if (selectedType.type === 'request' && selectedType.listingType === 'sale') {
      navigate("/seller-form?type=buyer");
    } else if (selectedType.type === 'request' && selectedType.listingType === 'rent') {
      navigate("/seller-form?type=buyer&rent=true");
    } else if (selectedType.type === 'offer' && selectedType.listingType === 'investment') {
      navigate("/seller-form?type=investment");
    } else if (selectedType.type === 'request' && selectedType.listingType === 'investment') {
      navigate("/investor");
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة إعلان جديد</DialogTitle>
          <DialogDescription>
            اختر نوع الإعلان الذي تريد إضافته
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Offer - Sale */}
          <Card
            className={`cursor-pointer hover:border-emerald-500 transition-colors ${
              selectedType?.type === 'offer' && selectedType?.listingType === 'sale'
                ? 'border-emerald-500 border-2'
                : ''
            }`}
            onClick={() => handleSelect('offer', 'sale')}
          >
            <CardContent className="p-6 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold mb-1">عرض عقار للبيع</h3>
              <p className="text-sm text-muted-foreground">أعرض عقار للبيع</p>
            </CardContent>
          </Card>

          {/* Offer - Rent */}
          <Card
            className={`cursor-pointer hover:border-emerald-500 transition-colors ${
              selectedType?.type === 'offer' && selectedType?.listingType === 'rent'
                ? 'border-emerald-500 border-2'
                : ''
            }`}
            onClick={() => handleSelect('offer', 'rent')}
          >
            <CardContent className="p-6 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">عرض عقار للإيجار</h3>
              <p className="text-sm text-muted-foreground">أعرض عقار للإيجار</p>
            </CardContent>
          </Card>

          {/* Request - Sale */}
          <Card
            className={`cursor-pointer hover:border-emerald-500 transition-colors ${
              selectedType?.type === 'request' && selectedType?.listingType === 'sale'
                ? 'border-emerald-500 border-2'
                : ''
            }`}
            onClick={() => handleSelect('request', 'sale')}
          >
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">طلب شراء</h3>
              <p className="text-sm text-muted-foreground">أبحث عن عقار للشراء</p>
            </CardContent>
          </Card>

          {/* Request - Rent */}
          <Card
            className={`cursor-pointer hover:border-emerald-500 transition-colors ${
              selectedType?.type === 'request' && selectedType?.listingType === 'rent'
                ? 'border-emerald-500 border-2'
                : ''
            }`}
            onClick={() => handleSelect('request', 'rent')}
          >
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">طلب إيجار</h3>
              <p className="text-sm text-muted-foreground">أبحث عن عقار للإيجار</p>
            </CardContent>
          </Card>

          {/* Offer - Investment */}
          <Card
            className={`cursor-pointer hover:border-emerald-500 transition-colors ${
              selectedType?.type === 'offer' && selectedType?.listingType === 'investment'
                ? 'border-emerald-500 border-2'
                : ''
            }`}
            onClick={() => handleSelect('offer', 'investment')}
          >
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">عرض استثمار</h3>
              <p className="text-sm text-muted-foreground">أعرض فرصة استثمارية</p>
            </CardContent>
          </Card>

          {/* Request - Investment */}
          <Card
            className={`cursor-pointer hover:border-emerald-500 transition-colors ${
              selectedType?.type === 'request' && selectedType?.listingType === 'investment'
                ? 'border-emerald-500 border-2'
                : ''
            }`}
            onClick={() => handleSelect('request', 'investment')}
          >
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <h3 className="font-semibold mb-1">طلب استثمار</h3>
              <p className="text-sm text-muted-foreground">أبحث عن فرصة استثمارية</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleContinue}
            disabled={!selectedType}
          >
            متابعة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

