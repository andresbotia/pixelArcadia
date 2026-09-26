/**
 * Every Game Center identifier Pixel Arcadia uses — the ONLY place these
 * strings live. These are the final production ids of the resources
 * configured in App Store Connect (Features → Game Center):
 *
 *  - Leaderboard "Campaign Progress"  → pixel_arcadia_campaign_progress
 *  - Achievement "World 1 Complete"   → pixel_arcadia_world_1_complete
 *  - Achievement "World 2 Complete"   → pixel_arcadia_world_2_complete
 *
 * They must stay byte-for-byte identical to App Store Connect. A new resource
 * is created there first, then added here.
 */
export const GAME_CENTER_IDS = {
  leaderboards: {
    /** Classic, best-score-wins. Score = highest campaign level cleared. */
    campaignProgress: 'pixel_arcadia_campaign_progress',
  },
  achievements: {
    world1Complete: 'pixel_arcadia_world_1_complete',
    world2Complete: 'pixel_arcadia_world_2_complete',
  },
} as const;

/**
 * World-completion achievements, keyed by campaign-manifest world id. The
 * finale level comes from the manifest (the world's last level), never a
 * hard-coded number. Add a row per future world achievement.
 */
export const WORLD_COMPLETION_ACHIEVEMENTS: readonly { worldId: string; achievementId: string }[] = [
  { worldId: 'first-light', achievementId: GAME_CENTER_IDS.achievements.world1Complete },
  { worldId: 'wild-garden', achievementId: GAME_CENTER_IDS.achievements.world2Complete },
];
