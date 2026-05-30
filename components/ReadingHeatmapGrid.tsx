"use client";

import { useRef, useEffect } from "react";

export type Cell = {
  date: string;
  books: string[];
  writings: string[];
  isFuture: boolean;
};

type MonthLabel = { col: number; label: string };

type Props = {
  weeks: Cell[][];
  monthLabels: MonthLabel[];
  totalBooks: number;
  totalWritings: number;
};

const CELL = "w-3 h-3 rounded-[2px]";
const COL_WIDTH = 15;

function cellColor(cell: Cell) {
  if (cell.isFuture) return "bg-gray-50";
  const hasBook = cell.books.length > 0;
  const hasWriting = cell.writings.length > 0;
  if (!hasBook && !hasWriting) return "bg-gray-100";
  if (hasBook && hasWriting) return "bg-violet-400";
  if (hasBook) return cell.books.length === 1 ? "bg-amber-300" : "bg-amber-500";
  return cell.writings.length === 1 ? "bg-blue-300" : "bg-blue-500";
}

export default function ReadingHeatmapGrid({ weeks, monthLabels, totalBooks, totalWritings }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
                const hasActivity = day.books.length > 0 || day.writings.length > 0;
                const tooltipPos =
                  d < 3
                    ? "top-full left-1/2 -translate-x-1/2 mt-1.5"
                    : "bottom-full left-1/2 -translate-x-1/2 mb-1.5";

                return (
                  <div key={day.date} className="relative group/cell">
                    <div className={`${CELL} ${cellColor(day)}`} />

                    {hasActivity && (
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
                          <p key={title} className="font-medium text-amber-300">📚 {title}</p>
                        ))}
                        {day.writings.map((title) => (
                          <p key={title} className="font-medium text-blue-300">✍️ {title}</p>
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

      {/* 범례 + 통계 */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-[11px] text-gray-300">
          최근 1년간 총 {totalBooks}권 완독 · {totalWritings}편 연재
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className={`${CELL} bg-amber-300`} />
            <div className={`${CELL} bg-amber-500`} />
            <span className="text-[10px] text-gray-300 ml-0.5">독서</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`${CELL} bg-blue-300`} />
            <div className={`${CELL} bg-blue-500`} />
            <span className="text-[10px] text-gray-300 ml-0.5">연재</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`${CELL} bg-violet-400`} />
            <span className="text-[10px] text-gray-300 ml-0.5">둘 다</span>
          </div>
        </div>
      </div>
    </>
  );
}
