/**
 * Lightweight client & server telemetry event logger
 * Automatically sends events to Vercel Analytics and console in development
 */

export type TelemetryEvent =
  | 'scan_started'
  | 'scan_completed'
  | 'scan_failed'
  | 'export_card_clicked'
  | 'share_twitter_clicked'
  | 'copy_badge_clicked'
  | 'bookmark_toggled'
  | 'upgrade_modal_opened'
  | 'sprint_pass_clicked'
  | 'pro_monthly_clicked'
  | 'pro_yearly_clicked'
  | 'weekly_newsletter_subscribed';

export function trackEvent(eventName: TelemetryEvent, metadata: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  // Development logger
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📊 [Telemetry Event]: ${eventName}`, metadata);
  }

  // Vercel Analytics custom event if available
  try {
    const va = (window as any).va;
    if (typeof va === 'function') {
      va('event', { name: eventName, data: metadata });
    }
  } catch {
    // ignore
  }
}
