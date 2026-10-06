export function academicYearFor(date: Date) {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

export function currentAcademicYear() {
  return academicYearFor(new Date());
}

export function deadlineYear(academicYear: string) {
  return academicYear.split("-")[1];
}