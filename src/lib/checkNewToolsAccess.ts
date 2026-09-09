/**
 * @deprecated Superseded by centralized entitlements in `@/lib/checkEntitlement`.
 * Consolidated to prevent drift across scattered gating checks.
 */

import { checkEntitlement, incrementFeatureUsage, type EntitlementCheckResult } from './checkEntitlement';

export type AccessCheckResult = EntitlementCheckResult;

export async function checkNewToolsAccess(userId: string | null): Promise<AccessCheckResult> {
  return checkEntitlement(userId, 'newTools');
}

export async function incrementNewToolsUsage(userId: string): Promise<void> {
  return incrementFeatureUsage(userId, 'newTools');
}
