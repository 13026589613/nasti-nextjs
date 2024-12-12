export function formatDate(inputDate: string): string {
  if (!inputDate) return "";
  const parts = inputDate.split("/");
  const month = parts[0].padStart(2, "0");
  const day = parts[1].padStart(2, "0");
  const year = parts[2];

  return `${year}-${month}-${day}`;
}
