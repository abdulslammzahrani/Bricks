import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, Loader2 } from "lucide-react";

interface LeadCaptureFormProps {
  onSuccess: (data: { name: string; phone: string; email?: string; unlockToken: string }) => void;
  slug: string;
  marketerRef?: string;
}

function validateSaudiPhone(phone: string): { isValid: boolean; normalized: string; error: string } {
  let normalized = phone.replace(/[^\d]/g, '');
  if (normalized.startsWith('966')) {
    normalized = '0' + normalized.slice(3);
  }
  
  if (normalized.startsWith('05') && normalized.length === 10) {
    return { isValid: true, normalized, error: '' };
  }
  
  return { isValid: false, normalized: '', error: 'رقم الجوال غير صحيح' };
}

export default function LeadCaptureForm({ onSuccess, slug, marketerRef }: LeadCaptureFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value.trim()) {
      const validation = validateSaudiPhone(value);
      setPhoneError(validation.isValid ? "" : validation.error);
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "الاسم مطلوب",
        variant: "destructive",
      });
      return;
    }

    const phoneValidation = validateSaudiPhone(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      toast({
        title: "خطأ",
        description: phoneValidation.error,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = `/api/landing-pages/${slug}/lead${marketerRef ? `?ref=${marketerRef}` : ''}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phoneValidation.normalized,
          email: email.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في التسجيل");
      }

      const data = await response.json();
      
      onSuccess({
        name: name.trim(),
        phone: phoneValidation.normalized,
        email: email.trim() || undefined,
        unlockToken: data.unlockToken,
      });

      toast({
        title: "تم التسجيل بنجاح",
        description: "شكراً لاهتمامك بالعقار",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء التسجيل",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-center">اهتمامك بالعقار</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          أدخل بياناتك الأساسية للاطلاع على تفاصيل أكثر
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">الاسم</Label>
            <div className="relative mt-1">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className="pr-10"
                required
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">رقم الجوال</Label>
            <div className="relative mt-1">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="05xxxxxxxx"
                className="pr-10"
                required
                dir="ltr"
              />
            </div>
            {phoneError && (
              <p className="text-sm text-destructive mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
            <div className="relative mt-1">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="pr-10"
                dir="ltr"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري التسجيل...
              </>
            ) : (
              "متابعة"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



