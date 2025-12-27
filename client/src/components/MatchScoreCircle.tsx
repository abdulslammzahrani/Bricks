import { Check, X, Minus } from 'lucide-react';

interface MatchScoreCircleProps {
  percentage: number;
  label: string;
}

export function MatchScoreCircle({ percentage, label }: MatchScoreCircleProps) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const getColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // green
    if (percentage >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const color = getColor(percentage);

  return (
    <div className="relative flex flex-col items-center">
      <svg className="transform -rotate-90" width="90" height="90">
        {/* Background circle */}
        <circle
          cx="45"
          cy="45"
          r="40"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="45"
          cy="45"
          r="40"
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold" style={{ color }}>
          {percentage}%
        </div>
        <div className="text-xs text-gray-600">{label}</div>
      </div>
    </div>
  );
}



