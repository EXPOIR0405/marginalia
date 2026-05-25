import { getAllBooks } from "@/lib/mdx";
import ReadingHeatmapGrid, { type Cell } from "./ReadingHeatmapGrid";

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
      const dateStr = toLocalDateStr(date);
      const books = dateMap[dateStr] ?? [];
      week.push({ date: dateStr, count: books.length, books, isFuture: date > today });
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

export default function ReadingHeatmap() {
  const { weeks, monthLabels } = buildHeatmap();
  const totalBooks = getAllBooks().length;

  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
        Reading Activity
      </h2>
      <ReadingHeatmapGrid weeks={weeks} monthLabels={monthLabels} totalBooks={totalBooks} />
    </section>
  );
}
