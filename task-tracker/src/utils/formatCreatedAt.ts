// Formats a created time as "20 Nov, 4:36 PM", adding the year when it is not this year.
export function formatCreatedAt(value: string) {
  const date = new Date(value);
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const yearLabel = year === new Date().getFullYear() ? "" : ` ${year}`;

  return `${day} ${month}${yearLabel}, ${hour12}:${minutes} ${period}`;
}
