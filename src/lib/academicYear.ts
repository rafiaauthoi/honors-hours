export function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayString() {
  return toDateString(new Date());
}

export function academicYearOf(dateString: string) {
  const [year, month] = dateString.split("-").map(Number);
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

export function currentAcademicYear() {
  return academicYearOf(todayString());
}

export function deadlineYear(academicYear: string) {
  return academicYear.split("-")[1];
}

export function academicYearRange(academicYear: string) {
  const [startYear, endYear] = academicYear.split("-");
  return { from: `${startYear}-07-01`, to: `${endYear}-06-30` };
}

export function recentAcademicYears(count: number) {
  const startYear = Number(currentAcademicYear().split("-")[0]);
  return Array.from({ length: count }, (_, index) => {
    const year = startYear - index;
    return `${year}-${year + 1}`;
  });
}

export function daysUntilDeadline(academicYear: string) {
  const deadline = new Date(Number(deadlineYear(academicYear)), 5, 30);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((deadline.getTime() - today.getTime()) / 86400000);
}

export function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}