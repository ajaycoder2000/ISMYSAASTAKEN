/**
 * Badge Qualification and Embed Snippet Utilities
 */

export interface BadgeEligibleScan {
  saturationScore?: string;
  gapAnalysis?: string;
}

/**
 * Determine if a scan is eligible for the "Validated by IsMySaaSTaken" trust badge.
 * Bar: Saturation must not be high (must be 'low' or 'medium') AND must have an identified gap.
 */
export function isBadgeEligible(scan?: BadgeEligibleScan | null): boolean {
  if (!scan) return false;
  const score = (scan.saturationScore || '').toLowerCase();
  const hasGap = Boolean(scan.gapAnalysis && scan.gapAnalysis.trim().length > 10);
  return (score === 'low' || score === 'medium') && hasGap;
}

export function getSiteBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://ismysaastaken.vercel.app';
}

export function getBadgeImageUrl(
  scanId: string,
  theme: 'dark' | 'light' | 'transparent' = 'dark'
): string {
  const base = getSiteBaseUrl();
  const query = theme !== 'dark' ? `?theme=${theme}` : '';
  return `${base}/api/badge/${scanId}${query}`;
}

export function getBadgeVerificationUrl(scanId: string): string {
  const base = getSiteBaseUrl();
  return `${base}/badge/${scanId}?utm_source=badge`;
}

export function getBadgeHtmlSnippet(
  scanId: string,
  theme: 'dark' | 'light' | 'transparent' = 'dark'
): string {
  const imgUrl = getBadgeImageUrl(scanId, theme);
  const verifyUrl = getBadgeVerificationUrl(scanId);
  return `<a href="${verifyUrl}" target="_blank" rel="noopener"><img src="${imgUrl}" alt="Validated by IsMySaaSTaken" width="280" height="80" /></a>`;
}

export function getBadgeMarkdownSnippet(
  scanId: string,
  theme: 'dark' | 'light' | 'transparent' = 'dark'
): string {
  const imgUrl = getBadgeImageUrl(scanId, theme);
  const verifyUrl = getBadgeVerificationUrl(scanId);
  return `[![Validated by IsMySaaSTaken](${imgUrl})](${verifyUrl})`;
}
