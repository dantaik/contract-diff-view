/**
 * Format a Unix timestamp (in seconds) as `YYYY-MM-DD HH:MM:SS UTC`.
 */
export function formatUtcTimestamp(timestampSeconds: number): string {
  const date = new Date(timestampSeconds * 1000);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  const pad = (value: number, length = 2) => String(value).padStart(length, '0');

  const year = pad(date.getUTCFullYear(), 4);
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}
