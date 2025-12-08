import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Send, Building, Landmark, Factory, Home } from "lucide-react";

interface InvestorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type InvestorType = "residential" | "commercial" | "industrial" | "land";

const investorTypes: { id: InvestorType; label: string; icon: typeof Building }[] = [
  { id: "residential", label: "سكني", icon: Home },
  { id: "commercial", label: "تجاري", icon: Building },
  { id: "industrial", label: "صناعي", icon: Factory },
  { id: "land", label: "أراضي", icon: Landmark },
];

const exampleText = `اسمي خالد المحمد، رقم جوالي 0551234567، مستثمر في القطاع العقاري منذ 10 سنوات، أبحث عن فرص استثمارية في الرياض وجدة، ميزانيتي من 5 إلى 20 مليون ريال، مهتم بالعقارات التجارية والسكنية ذات العائد المرتفع.`;

export function InvestorModal({ open, onOpenChange }: InvestorModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<InvestorType[]>([]);
  const [inputText, setInputText] = useState("");

  const toggleType = (type: InvestorType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = () => {
    console.log("Investor submission:", { selectedTypes, inputText });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <TrendingUp className="h-6 w-6" />
            فرص استثمارية عقارية
          </DialogTitle>
          <DialogDescription>
            سجل اهتمامك الاستثماري للحصول على فرص حصرية
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">مثال على طلب استثماري:</p>
            <p className="text-sm leading-relaxed">{exampleText}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">نوع الاستثمار المفضل:</label>
            <div className="flex flex-wrap gap-2">
              {investorTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <Button
                    key={type.id}
                    type="button"
                    variant="outline"
                    onClick={() => toggleType(type.id)}
                    className={`gap-2 ${isSelected ? "bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : ""}`}
                    data-testid={`toggle-investor-type-${type.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">أخبرنا عن اهتماماتك الاستثمارية:</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب هنا تفاصيل اهتمامك الاستثماري، الميزانية، المدن المفضلة، نوع العائد المتوقع..."
              className="w-full min-h-[120px] p-3 rounded-lg border bg-background text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              data-testid="input-investor-details"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">مميزات التسجيل كمستثمر:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• الوصول المبكر للفرص الاستثمارية الحصرية</li>
              <li>• تقارير تحليلية عن السوق العقاري</li>
              <li>• توصيات مخصصة بناءً على اهتماماتك</li>
              <li>• التواصل المباشر مع المطورين العقاريين</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-investor"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            data-testid="button-submit-investor"
          >
            <Send className="h-4 w-4 ml-2" />
            إرسال طلب الاستثمار
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
