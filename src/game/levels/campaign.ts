import { CAMPAIGN_SCHEMA_VERSION } from '@/game/studio/constants';
import { normalizeManifest } from '@/game/studio/campaign/manifest';
import type { CampaignManifest, CampaignWorld } from '@/game/studio/campaign/types';
import { worldSkin } from '@/theme/worldSkins';
// Intentionally NOT `./levelDefinitions` — that is the pre-authoring-pipeline
// legacy list. This manifest must group by each level's REAL, currently-
// shipped themeId, which for worlds 3–12 comes from the JSON authoring
// pipeline's `replacesLegacy` overrides (see `./levels`, `./compiledLevels`).
// Grouping by the legacy file here was M4C.11-era stale campaign metadata
// (redesign audit finding B.6): it showed old placeholder world names
// ("Deep Frost", "Curio Cabinet", "Skybound", ...) that no longer match the
// actual authored content a player plays for those same level ids.
import { LEVEL_DEFINITIONS } from './levels';

/**
 * The Pixel Arcadia campaign manifest: sixteen themed worlds of ten levels each.
 * Authoring / campaign-organisation data only — it is NOT read by the engine and
 * carries no solver output. Each world's `levelIds` is filtered to the levels
 * that actually exist, so the manifest stays valid while a world is still being
 * authored.
 */
// `display.accent` is per-world identity colour for the world-select screen,
// sourced from `theme/worldSkins.ts` so there is exactly one authored accent
// value per world (not a second, hand-duplicated one here). Content data,
// like `orbColors`, never reused as chrome and never drawn from the 36
// gameplay colours (brand <-> gameplay separation).
const WORLD_BLUEPRINT: Omit<CampaignWorld, 'order' | 'levelIds'>[] = [
  { id: 'first-light', title: 'First Light', themeId: 'first-light', display: { subtitle: 'Learn the light', accent: worldSkin('first-light').accent } },
  { id: 'wild-garden', title: 'Wild Garden', themeId: 'wild-garden', display: { subtitle: 'The garden wakes', accent: worldSkin('wild-garden').accent } },
  { id: 'neon-nights', title: 'Neon Nights', themeId: 'neon-nights', display: { subtitle: 'The city lights up', accent: worldSkin('neon-nights').accent } },
  { id: 'mechanical-city', title: 'Mechanical City', themeId: 'mechanical-city', display: { subtitle: 'Gears within gears', accent: worldSkin('mechanical-city').accent } },
  { id: 'cosmic-frontier', title: 'Cosmic Frontier', themeId: 'cosmic-frontier', display: { subtitle: 'Beyond the last star', accent: worldSkin('cosmic-frontier').accent } },
  { id: 'world-landmarks', title: 'World Landmarks', themeId: 'world-landmarks', display: { subtitle: 'A tour beyond the map', accent: worldSkin('world-landmarks').accent } },
  { id: 'ocean-depths', title: 'Ocean Depths', themeId: 'ocean-depths', display: { subtitle: 'Into the deep blue', accent: worldSkin('ocean-depths').accent } },
  { id: 'mythic-realm', title: 'Mythic Realm', themeId: 'mythic-realm', display: { subtitle: 'Where legends stir', accent: worldSkin('mythic-realm').accent } },
  { id: 'prehistoric-titans', title: 'Prehistoric Titans', themeId: 'prehistoric-titans', display: { subtitle: 'Giants of a lost age', accent: worldSkin('prehistoric-titans').accent } },
  { id: 'masterpiece-gallery', title: 'Masterpiece Gallery', themeId: 'masterpiece-gallery', display: { subtitle: 'Art comes alive', accent: worldSkin('masterpiece-gallery').accent } },
  { id: 'ancient-empires', title: 'Ancient Empires', themeId: 'ancient-empires', display: { subtitle: 'Echoes of civilizations', accent: worldSkin('ancient-empires').accent } },
  { id: 'enchanted-forest', title: 'Enchanted Forest', themeId: 'enchanted-forest', display: { subtitle: 'Magic beneath the canopy', accent: worldSkin('enchanted-forest').accent } },
  { id: 'frozen-north', title: 'Frozen North', themeId: 'frozen-north', display: { subtitle: 'Lights over the ice', accent: worldSkin('frozen-north').accent } },
  { id: 'volcanic-forge', title: 'Volcanic Forge', themeId: 'volcanic-forge', display: { subtitle: 'Where fire is shaped', accent: worldSkin('volcanic-forge').accent } },
  { id: 'carnival-of-wonders', title: 'Carnival of Wonders', themeId: 'carnival-of-wonders', display: { subtitle: 'Step right up', accent: worldSkin('carnival-of-wonders').accent } },
  { id: 'lantern-dynasty', title: 'Lantern Dynasty', themeId: 'lantern-dynasty', display: { subtitle: 'A thousand lights rising', accent: worldSkin('lantern-dynasty').accent } },
];

const known = new Set(LEVEL_DEFINITIONS.map((l) => l.id));

export const CAMPAIGN_MANIFEST: CampaignManifest = normalizeManifest({
  campaignVersion: CAMPAIGN_SCHEMA_VERSION,
  worlds: WORLD_BLUEPRINT.map((w, order) => ({
    ...w,
    order,
    levelIds: LEVEL_DEFINITIONS.filter((l) => l.themeId === w.themeId && known.has(l.id)).map((l) => l.id),
  })).filter((w) => w.levelIds.length > 0),
  orderedLevelIds: LEVEL_DEFINITIONS.map((l) => l.id),
});
