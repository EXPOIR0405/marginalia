"use client";

import { useRef, useEffect } from "react";

export type Cell = {
  date: string;
  count: number;
  books: string[];
  isFuture: boolean;
};

type MonthLabel = { col: number; label: string };

type Props = {
  weeks: Cell[][];
  monthLabels: MonthLabel[];
  totalBooks: number;
};

const CELL = "w-3 h-3 rounded-[2px]";
const COL_WIDTH = 15;

function cellColor(count: number, isFuture: boolean) {
  if (isFuture) return "bg-gray-50";
  if (count === 0) return "bg-gray-100";
  if (count === 1) return "bg-amber-300";
  return "bg-amber-500";
}

export default function ReadingHeatmapGrid({ weeks, monthLabels, totalBooks }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 마운트 시 가장 오른쪽(최신)으로 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <>
      <div ref={scrollRef} className="overflow-x-auto pb-1">
        {/* 월 라벨 */}
        <div className="relative h-4 mb-1" style={{ width: `${53 * COL_WIDTH}px` }}>
          {monthLabels.map(({ col, label }) => (
            <span
              key={col}
              className="absolute text-[10px] text-gray-300"
              style={{ left: `${col * COL_WIDTH}px` }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* 잔디 그리드 */}
        <div className="flex gap-[3px]" style={{ minWidth: `${53 * COL_WIDTH}px` }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, d) => {
                const tooltipPos =
                  d < 3
                    ? "top-full left-1/2 -translate-x-1/2 mt-1.5"
                    : "bottom-full left-1/2 -translate-x-1/2 mb-1.5";

                return (
                  <div key={day.date} className="relative group/cell">
                    <div className={`${CELL} ${cellColor(day.count, day.isFuture)}`} />

                    {day.books.length > 0 && (
                      <div
                        className={`
                          pointer-events-none absolute z-20
                          ${tooltipPos}
                          bg-gray-800 text-white rounded-md px-2 py-1.5
                          text-[11px] leading-snug whitespace-nowrap shadow-lg
                          opacity-0 group-hover/cell:opacity-100
                          transition-opacity duration-150
                        `}
                      >
                        <p className="text-gray-400 mb-0.5">{day.date}</p>
                        {day.books.map((title) => (
                          <p key={title} className="font-medium">{title}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 + 총 권수 */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-[11px] text-gray-300">최근 1년간 총 {totalBooks}권 완독</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-300">적음</span>
          <div className={`${CELL} bg-gray-100`} />
          <div className={`${CELL} bg-amber-300`} />
          <div className={`${CELL} bg-amber-500`} />
          <span className="text-[10px] text-gray-300">많음</span>
        </div>
      </div>
    </>
  );
}
