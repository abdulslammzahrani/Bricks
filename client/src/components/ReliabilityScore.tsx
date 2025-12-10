import { useEffect, useState } from "react";

interface ReliabilityScoreProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function ReliabilityScore({ score, label = "مؤشر الموثوقية", size = "md" }: ReliabilityScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();
    const startScore = animatedScore;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startScore + (score - startScore) * easeOut;
      
      setAnimatedScore(Math.round(current));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);
  
  const dimensions = {
    sm: { size: 60, stroke: 4, fontSize: "text-sm" },
    md: { size: 80, stroke: 5, fontSize: "text-lg" },
    lg: { size: 100, stroke: 6, fontSize: "text-xl" },
  };
  
  const { size: circleSize, stroke, fontSize } = dimensions[size];
  const radius = (circleSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" };
    if (s >= 60) return { stroke: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" };
    if (s >= 40) return { stroke: "#f97316", bg: "rgba(249, 115, 22, 0.1)" };
    return { stroke: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
  };
  
  const colors = getColor(animatedScore);
  
  return (
    <div className="flex flex-col items-center gap-2" data-testid="reliability-score">
      <div 
        className="relative"
        style={{ width: circleSize, height: circleSize }}
      >
        <svg
          className="transform -rotate-90"
          width={circleSize}
          height={circleSize}
        >
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-muted/20"
          />
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.3s ease-out, stroke 0.3s ease-out",
            }}
          />
        </svg>
        
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: colors.bg, borderRadius: "50%" }}
        >
          <span 
            className={`font-bold ${fontSize}`}
            style={{ color: colors.stroke }}
            data-testid="reliability-score-value"
          >
            {animatedScore}%
          </span>
        </div>
      </div>
      
      <span className="text-xs text-muted-foreground text-center">
        {label}
      </span>
    </div>
  );
}

export function calculateReliabilityScore(extractedData: {
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  districts?: string[];
  propertyType?: string | null;
  budgetMax?: number | null;
  paymentMethod?: string | null;
  purchaseTimeline?: string | null;
  area?: number | null;
  propertyAge?: number | null;
  facing?: string | null;
  streetWidth?: number | null;
  purchasePurpose?: string | null;
}): number {
  let score = 0;
  
  // الحقول الأساسية (70%)
  if (extractedData.name) score += 10;
  if (extractedData.phone) score += 10;
  if (extractedData.city) score += 10;
  if (extractedData.districts && extractedData.districts.length > 0) score += 10;
  if (extractedData.propertyType) score += 10;
  if (extractedData.budgetMax) score += 10;
  if (extractedData.paymentMethod) score += 5;
  if (extractedData.purchaseTimeline) score += 5;
  
  // الحقول الإضافية للمطابقة (30%)
  if (extractedData.area) score += 6;
  if (extractedData.propertyAge !== undefined && extractedData.propertyAge !== null) score += 6;
  if (extractedData.facing) score += 6;
  if (extractedData.streetWidth) score += 6;
  if (extractedData.purchasePurpose) score += 6;
  
  return Math.min(100, score);
}
