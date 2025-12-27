import { Lock, MapPin, FileText, Phone, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ContentLockerProps {
  type: "map" | "floorPlan" | "sellerContact" | "extraImages";
  isLocked: boolean;
  onUnlock?: () => void;
  children: React.ReactNode;
  title?: string;
}

const lockIcons = {
  map: MapPin,
  floorPlan: FileText,
  sellerContact: Phone,
  extraImages: ImageIcon,
};

const lockTitles = {
  map: "الموقع الجغرافي الدقيق",
  floorPlan: "المخطط الهندسي",
  sellerContact: "معلومات التواصل",
  extraImages: "صور إضافية",
};

export default function ContentLocker({ 
  type, 
  isLocked, 
  onUnlock, 
  children,
  title 
}: ContentLockerProps) {
  const Icon = lockIcons[type];
  const displayTitle = title || lockTitles[type];

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Blurred Content */}
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10">
        <div className="bg-primary/10 rounded-full p-4 mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">{displayTitle}</h3>
        <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
          أدخل بياناتك الأساسية لعرض {displayTitle.toLowerCase()}
        </p>
        {onUnlock && (
          <Button onClick={onUnlock} size="lg">
            <Icon className="h-4 w-4 ml-2" />
            عرض المحتوى
          </Button>
        )}
      </div>
    </Card>
  );
}


