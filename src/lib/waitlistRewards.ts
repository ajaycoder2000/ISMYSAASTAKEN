// ONLY keep rewards you will really deliver. Change freely.
export const WAITLIST_BASE_REWARD = "1 bonus scan + Founding Member status";

export const REFERRAL_TIERS = [
  { friends: 1, label: "+1 bonus scan" },
  { friends: 3, label: "+3 bonus scans" },
  { friends: 5, label: "Early access before public launch" },
];

/**
 * Calculates total bonus scans granted to a waitlist user upon launch sign-up.
 * Base reward grants 1 bonus scan.
 * Each reached referral tier grants additional bonus scans.
 */
export function calculateWaitlistBonusScans(confirmedFriendsCount: number): number {
  let bonus = 1; // Base reward: 1 bonus scan
  for (const tier of REFERRAL_TIERS) {
    if (confirmedFriendsCount >= tier.friends) {
      bonus += 1;
    }
  }
  return bonus;
}
