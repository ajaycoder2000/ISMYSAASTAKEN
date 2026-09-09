/**
 * Single source of truth for plan entitlements and gating limits.
 * Every route that gates a feature imports from here.
 */

export const PLAN_ENTITLEMENTS = {
  free: {
    ideaScans: { limit: 1, period: 'lifetime' },
    newTools: { limit: 1, period: 'lifetime' }, // combined Keyword Radar + Is It Taken
    roastMode: true,
    validatedBadge: false,
  },
  sprint_pass: {
    ideaScans: { limit: 25, period: 'plan_duration' }, // 7 days from purchase
    newTools: { limit: null, period: 'plan_duration' }, // unlimited during the pass
    roastMode: true,
    validatedBadge: true,
  },
  founder_pro: {
    ideaScans: { limit: null, period: 'ongoing' },
    newTools: { limit: null, period: 'ongoing' },
    roastMode: true,
    validatedBadge: true,
  },
  studio: {
    ideaScans: { limit: null, period: 'ongoing' },
    newTools: { limit: null, period: 'ongoing' },
    roastMode: true,
    validatedBadge: true,
  },
} as const;

export type PlanId = keyof typeof PLAN_ENTITLEMENTS;
export type FeatureKey = 'ideaScans' | 'newTools';
