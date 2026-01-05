// src/components/ContributionGraph.tsx
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  activityData: Record<string, number>;
}

export default function ContributionGraph({ activityData }: Props) {
  // 최근 30일간의 데이터를 보여준다고 가정합니다.
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  // 빈도에 따른 색상 농도 결정 (가이드: 0, 1, 2, 3, 4회 이상)
  const getColor = (count: number) => {
    if (!count || count === 0) return "bg-slate-100";
    if (count === 1) return "bg-emerald-200";
    if (count === 2) return "bg-emerald-400";
    if (count === 3) return "bg-emerald-600";
    return "bg-emerald-800"; // 4회 이상
  };

  return (
    <TooltipProvider>
      <div className="flex gap-1 p-4 bg-white border rounded-xl overflow-x-auto">
        {days.map((date) => {
          const count = activityData[date] || 0;
          return (
            <Tooltip key={date}>
              <TooltipTrigger asChild>
                <div
                  className={`w-4 h-4 rounded-sm ${getColor(
                    count
                  )} transition-colors`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {date}: {count}회 활동
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
