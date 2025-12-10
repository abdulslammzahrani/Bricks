import { useState, useEffect, memo } from "react";
import { ExampleSegment } from "@/data/examples";

interface TypewriterBannerProps {
  segments: ExampleSegment[];
  fullText: string;
  mode: "buyer" | "seller" | "investor";
  onExampleComplete: () => void;
  onTextClick: (text: string) => void;
}

const TypewriterBannerComponent = ({ 
  segments, 
  fullText, 
  mode, 
  onExampleComplete,
  onTextClick 
}: TypewriterBannerProps) => {
  const [charIndex, setCharIndex] = useState(0);
  
  // Reset when segments change
  useEffect(() => {
    setCharIndex(0);
  }, [fullText]);
  
  // Typewriter effect - types then waits 3 seconds before signaling completion
  useEffect(() => {
    const totalLength = segments.reduce((acc, seg) => acc + seg.text.length, 0);
    if (charIndex < totalLength) {
      const timer = setTimeout(() => {
        setCharIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onExampleComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [charIndex, segments, onExampleComplete]);
  
  // Render typed text with highlighting
  const renderTypedText = () => {
    let remaining = charIndex;
    return segments.map((segment, idx) => {
      if (remaining <= 0) return null;
      
      const chars = Math.min(remaining, segment.text.length);
      remaining -= segment.text.length;
      const displayText = segment.text.slice(0, chars);
      
      // Use color from segment, or default styling
      const style = segment.color ? { color: segment.color } : {};
      const className = segment.underline ? "underline font-semibold" : (segment.color ? "font-semibold" : "");
      
      return (
        <span key={idx} className={className} style={style}>
          {displayText}
        </span>
      );
    });
  };

  const labelText = mode === "buyer" ? "عميل يطلب الآن:" : "عقار معروض الآن:";
  const dotColor = mode === "buyer" ? "bg-red-500" : "bg-green-500";
  const textColor = mode === "buyer" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";

  return (
    <div className="mb-2">
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="relative flex h-2 w-2">
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
        </span>
        <p className={`text-xs font-medium ${textColor}`}>
          {labelText}
        </p>
      </div>
      <div 
        className="text-center cursor-pointer min-h-[40px] flex items-center justify-center px-2 overflow-hidden"
        onClick={() => onTextClick(fullText)}
        data-testid="button-typewriter-example"
      >
        <p className="text-sm leading-relaxed line-clamp-2">
          {renderTypedText()}
          <span className="text-muted-foreground">...</span>
          <span className="text-primary font-bold">|</span>
        </p>
      </div>
    </div>
  );
};

export const TypewriterBanner = memo(TypewriterBannerComponent);
