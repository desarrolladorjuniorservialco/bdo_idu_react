const DRIVE_FILE_REGEX = /\/d\/([\w-]+)\//;

export function driveUrlToProxyUrl(url: string): string {
  const match = url.match(DRIVE_FILE_REGEX);
  if (!match) return url;
  return `/api/foto?id=${match[1]}`;
}
