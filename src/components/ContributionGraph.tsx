"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  activityData: Record<string, number>; // "YYYY-MM-DD" -> count
  daysToShow?: number; // 기본 365
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function toYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeekSunday(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  return d;
}

/**
 * 레벨 고정: 0, 1–2, 3–4, 5–7, 8+
 */
function levelOf(count: number) {
  if (!count || count <= 0) return 0;
  if (count <= 2) return 1; // 1–2
  if (count <= 4) return 2; // 3–4
  if (count <= 7) return 3; // 5–7
  return 4; // 8+
}

/**
 * 화이트 배경용 팔레트 (회색 -> 연초록 -> 진초록)
 * - 0: 아주 연한 회색
 * - 1: 연한 그린
 * - 2: 중간 그린
 * - 3: 진한 그린
 * - 4: 더 진한 그린
 */
function bgClass(level: number) {
  switch (level) {
    case 0:
      return "bg-slate-100";
    case 1:
      return "bg-emerald-200";
    case 2:
      return "bg-emerald-400";
    case 3:
      return "bg-emerald-600";
    case 4:
      return "bg-emerald-800";
    default:
      return "bg-slate-100";
  }
}

/**
 * 0칸 hover 디테일
 * - 0 레벨일 때는 hover 시 아주 연한 green tint
 * - 1~4 레벨도 hover 시 살짝 밝게 + 테두리 강화
 */
function hoverClass(level: number) {
  if (level === 0) {
    return "hover:bg-emerald-100 hover:outline-emerald-300/60";
  }
  return "hover:brightness-110 hover:outline-emerald-500/40";
}

export default function ContributionGraph({
  activityData,
  daysToShow = 365,
}: Props) {
  const today = React.useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const endDate = today;
  const startDate = addDays(endDate, -(daysToShow - 1));

  const gridStart = startOfWeekSunday(startDate);
  const gridEnd = addDays(startOfWeekSunday(endDate), 6);

  const weeks: Date[][] = [];
  for (
    let wStart = new Date(gridStart);
    wStart <= gridEnd;
    wStart = addDays(wStart, 7)
  ) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) week.push(addDays(wStart, i));
    weeks.push(week);
  }

  const monthLabels = weeks.map((week, idx) => {
    const first = week[0];
    const prev = idx > 0 ? weeks[idx - 1][0] : null;
    const changed = !prev || first.getMonth() !== prev.getMonth();
    return changed ? MONTHS[first.getMonth()] : "";
  });

  const weekdayLabels = ["", "Mon", "", "Wed", "", "Fri", ""]; // GitHub 스타일

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* 월 라벨 */}
            <div className="flex gap-[3px] mb-2">
              <div className="w-10 shrink-0" />
              <div className="flex gap-[3px]">
                {monthLabels.map((m, idx) => (
                  <div
                    key={idx}
                    className="w-[11px] text-[12px] leading-none text-slate-600"
                    style={{ transform: "translateX(-2px)" }}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex">
              {/* 요일 라벨 */}
              <div className="w-10 shrink-0 flex flex-col gap-[3px] pr-2">
                {weekdayLabels.map((label, row) => (
                  <div
                    key={row}
                    className="h-[11px] text-[12px] leading-none text-slate-500 flex items-center"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* 그리드 */}
              <div className="flex gap-[3px]">
                {weeks.map((week, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-[3px]">
                    {week.map((d) => {
                      const inRange = d >= startDate && d <= endDate;
                      const key = toYMD(d);

                      const count = inRange ? activityData[key] ?? 0 : 0;
                      const lv = inRange ? levelOf(count) : 0;

                      return (
                        <Tooltip key={key}>
                          <TooltipTrigger asChild>
                            <div
                              className={[
                                "h-[11px] w-[11px] rounded-[2px]",
                                inRange ? bgClass(lv) : "bg-transparent",
                                "outline outline-1 outline-black/10",
                                "transition-all duration-150",
                                inRange ? hoverClass(lv) : "",
                                "hover:outline hover:outline-2", // hover 시 테두리 강조
                              ].join(" ")}
                              aria-label={`${key}: ${count} contributions`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {key}: {count}회 활동
                              {count > 0 && (
                                <span className="text-slate-500">
                                  {" "}
                                  (레벨 {lv}/4)
                                </span>
                              )}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 범례 */}
            <div className="mt-4 flex items-center justify-between text-slate-600">
              <div className="text-sm">Learn how we count contributions</div>

              <div className="flex items-center gap-2 text-sm">
                <span>Less</span>
                <div className="flex items-center gap-[3px]">
                  {[0, 1, 2, 3, 4].map((lv) => (
                    <div
                      key={lv}
                      className={[
                        "h-[11px] w-[11px] rounded-[2px]",
                        bgClass(lv),
                        "outline outline-1 outline-black/10",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>

            {/* (선택) 레벨 기준 안내: 필요 없으면 삭제 */}
            <div className="mt-2 text-[12px] text-slate-500">
              Levels: 0, 1–2, 3–4, 5–7, 8+
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
