import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

interface MatchScoreCardProps {
  score: number;
  maxScore?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function MatchScoreCard({ 
  score, 
  maxScore = 105, 
  showLabel = true,
  size = "md"
}: MatchScoreCardProps) {
  const percentage = Math.round((score / maxScore) * 100);
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", stroke: "#10b981" };
    if (percentage >= 60) return { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", stroke: "#3b82f6" };
    if (percentage >= 40) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", stroke: "#f59e0b" };
    return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", stroke: "#ef4444" };
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return "ممتاز";
    if (percentage >= 60) return "جيد";
    if (percentage >= 40) return "متوسط";
    return "ضعيف";
  };

  const colors = getScoreColor(percentage);
  const label = getScoreLabel(percentage);
  
  const sizeClasses = {
    sm: { circle: "w-16 h-16", text: "text-lg", label: "text-xs", icon: "w-4 h-4" },
    md: { circle: "w-24 h-24", text: "text-2xl", label: "text-sm", icon: "w-5 h-5" },
    lg: { circle: "w-32 h-32", text: "text-3xl", label: "text-base", icon: "w-6 h-6" },
  };

  const sizeConfig = sizeClasses[size];
  const circumference = 2 * Math.PI * (size === "sm" ? 30 : size === "md" ? 40 : 50);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className={`${colors.bg} ${colors.border} border-2`}>
      <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
        <div className={`relative ${sizeConfig.circle}`}>
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={size === "sm" ? "30" : size === "md" ? "40" : "50"}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={size === "sm" ? "30" : size === "md" ? "40" : "50"}
              stroke={colors.stroke}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`${sizeConfig.text} font-bold ${colors.text}`}>
              {percentage}%
            </span>
            {showLabel && (
              <span className={`${sizeConfig.label} text-muted-foreground mt-0.5`}>
                {label}
              </span>
            )}
          </div>
        </div>
        
        {showLabel && (
          <div className="flex items-center gap-2 mt-2">
            <Target className={`${sizeConfig.icon} ${colors.text}`} />
            <Badge variant="outline" className={`${colors.border} ${colors.text} border-2`}>
              {score}/{maxScore}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

