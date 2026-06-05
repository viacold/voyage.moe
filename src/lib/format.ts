export function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function byNewestDate<T extends { date: string }>(items: T[]) {
  return [...items].sort((left, right) => right.date.localeCompare(left.date));
}

export function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}
