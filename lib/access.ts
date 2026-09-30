export function isAccessExpired(expiresAt: string | null | undefined): boolean {
  return Boolean(expiresAt && Date.parse(expiresAt) <= Date.now());
}

