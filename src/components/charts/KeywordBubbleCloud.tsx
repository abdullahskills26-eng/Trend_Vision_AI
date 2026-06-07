import React from 'react';
import type { KeywordTrend } from '../../types';

interface KeywordBubbleCloudProps {
  keywords: KeywordTrend[];
}

export default function KeywordBubbleCloud({ keywords }: KeywordBubbleCloudProps) {
  // Simple deterministic pseudo-random for layout
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return Math.abs(h);
  };

  const getColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'var(--color-brand-accent)';
      case 'falling': return 'var(--color-brand-danger)';
      default: return 'var(--color-brand-warning)';
    }
  };

  return (
    <div className="relative w-full h-[250px] overflow-hidden rounded-xl border border-[var(--bg-border)] bg-[var(--bg-elevated)]">
      {keywords.map((kw, idx) => {
        // Calculate bubble size and position based on weight and hash
        const size = Math.max(60, Math.min(140, kw.weight * 1.5));
        const seed = hash(kw.word + idx);
        
        // Distribute them roughly around the center
        const top = 10 + (seed % 70); // 10% to 80%
        const left = 5 + ((seed * 7) % 80); // 5% to 85%
        
        const delay = (seed % 10) * 0.1; // 0 to 1s delay
        const duration = 3 + (seed % 3); // 3 to 6s float

        return (
          <div
            key={kw.word}
            className="absolute rounded-full flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:scale-110 cursor-pointer backdrop-blur-md"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${top}%`,
              left: `${left}%`,
              backgroundColor: `${getColor(kw.trend)}20`,
              border: `2px solid ${getColor(kw.trend)}60`,
              color: 'var(--text-primary)',
              animation: `float ${duration}s ease-in-out infinite alternate`,
              animationDelay: `${delay}s`,
            }}
            title={`Weight: ${kw.weight}% | Trend: ${kw.trend}`}
          >
            <span className="font-bold leading-tight px-2 break-words" style={{ fontSize: `${Math.max(10, size / 6)}px` }}>
              {kw.word}
            </span>
            <span className="text-[10px] opacity-80 mt-1 uppercase tracking-wider font-mono">
              {kw.trend}
            </span>
          </div>
        );
      })}
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-15px) scale(1.02); }
        }
      `}</style>
    </div>
  );
}
