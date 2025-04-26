/**
 * Formats a date to a relative time string (e.g., "2 days ago", "just now")
 * @param date The date to format
 * @returns A string describing the relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const diff = now.getTime() - targetDate.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} ${years === 1 ? "year" : "years"} ago`;
  if (months > 0) return `${months} ${months === 1 ? "month" : "months"} ago`;
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"} ago`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  return "just now";
}

/**
 * Formats a date to a long, readable format (e.g., "April 27, 2025")
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatFullDate(date: Date | string): string {
  const targetDate = typeof date === "string" ? new Date(date) : date;

  return targetDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
