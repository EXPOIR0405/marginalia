import { getAllBooks } from "@/lib/mdx";

type Cell = {
  date: string;
  count: number;
  books: string[];
  isFuture: boolean;
};

/** 로컬 시간 기준 YYYY-MM-DD 반환 (UTC 변환 방지) */
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildHeatmap(): { weeks: Cell[][]; monthLabels: { col: number; label: string }[] } {
  const allBooks = getAllBooks();

  const dateMap: Record<string, string[]> = {};
  allBooks.forEach((b) => {
    const d = b.readDate.slice(0, 10);
    if (!dateMap[d]) dateMap[d] = [];
    dateMap[d].push(b.title);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 52주 전 일요일
  const start = new Date(today);
  start.setDate(today.getDate() - 52 * 7);
  start.setDate(start.getDate() - start.getDay());

  const weeks: Cell[][] = [];
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;

  for (let w = 0; w < 53; w++) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const dateStr = toLocalDateStr(date); // ← UTC 변환 없이 로컬 날짜 사용
      const books = dateMap[dateStr] ?? [];
      week.push({
        date: dateStr,
        count: books.length,
        books,
        isFuture: date > today,
      });
    }

    const firstDay = new Date(week[0].date);
    const month = firstDay.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({
        col: w,
        label: firstDay.toLocaleDateString("ko-KR", { month: "short" }),
      });
      lastMonth = month;
    }
    weeks.push(week);
  }

  return { weeks, monthLabels };
}

function cellColor(count: number, isFuture: boolean) {
  if (isFuture) return "bg-gray-50";
  if (count === 0) return "bg-gray-100";
  if (count === 1) return "bg-amber-300";
  return "bg-amber-500";
}

const CELL = "w-3 h-3 rounded-[2px]";
const COL_WIDTH = 15; // 12px cell + 3px gap

export default function ReadingHeatmap() {
  const { weeks, monthLabels } = buildHeatmap();
  const totalBooks = getAllBooks().length;

  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
        Reading Activity
      </h2>

      <div className="overflow-x-auto pb-1">
        {/* 월 라벨 */}
        <div
          className="relative h-4 mb-1"
          style={{ width: `${53 * COL_WIDTH}px` }}
        >
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
        <div
          className="flex gap-[3px]"
          style={{ minWidth: `${53 * COL_WIDTH}px` }}
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, d) => {
                // 위쪽 3행(일·월·화)은 툴팁을 아래로, 나머지는 위로
                const tooltipPos =
                  d < 3
                    ? "top-full left-1/2 -translate-x-1/2 mt-1.5"
                    : "bottom-full left-1/2 -translate-x-1/2 mb-1.5";

                return (
                  <div key={day.date} className="relative group/cell">
                    {/* 셀 */}
                    <div className={`${CELL} ${cellColor(day.count, day.isFuture)}`} />

                    {/* 커스텀 툴팁 — 책이 있는 날만 */}
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
    </section>
  );
}
