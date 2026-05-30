import { getAllBooks, getAllWritings } from "@/lib/mdx";
import ReadingHeatmapGrid, { type Cell } from "./ReadingHeatmapGrid";

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildHeatmap(): { weeks: Cell[][]; monthLabels: { col: number; label: string }[]; totalWeeks: number } {
  const allBooks = getAllBooks();
  const allWritings = getAllWritings();

  const bookMap: Record<string, string[]> = {};
  allBooks.forEach((b) => {
    const d = b.readDate.slice(0, 10);
    if (!bookMap[d]) bookMap[d] = [];
    bookMap[d].push(b.title);
  });

  const writingMap: Record<string, string[]> = {};
  allWritings.forEach((w) => {
    const d = w.date.slice(0, 10);
    if (!writingMap[d]) writingMap[d] = [];
    writingMap[d].push(w.title);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today.getFullYear(), 3, 1); // 4월 1일
  start.setDate(start.getDate() - start.getDay()); // 해당 주 일요일로 맞춤

  const weeks: Cell[][] = [];
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;

  const totalWeeks = Math.ceil((today.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  for (let w = 0; w < totalWeeks; w++) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const dateStr = toLocalDateStr(date);
      const books = bookMap[dateStr] ?? [];
      const writings = writingMap[dateStr] ?? [];
      week.push({ date: dateStr, books, writings, isFuture: date > today });
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

  return { weeks, monthLabels, totalWeeks };
}

export default function ReadingHeatmap() {
  const { weeks, monthLabels, totalWeeks } = buildHeatmap();
  const totalBooks = getAllBooks().length;
  const totalWritings = getAllWritings().length;

  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
        Reading Activity
      </h2>
      <ReadingHeatmapGrid
        weeks={weeks}
        monthLabels={monthLabels}
        totalBooks={totalBooks}
        totalWritings={totalWritings}
        totalWeeks={totalWeeks}
      />
    </section>
  );
}
