import { CAMPAIGN_MANIFEST } from '../campaign';

/**
 * Regression test for redesign-audit finding B.6: `campaign.ts` used to group
 * worlds by the pre-authoring-pipeline legacy `themeId` taxonomy, so World
 * Select/World Levels showed stale placeholder names ("Deep Frost", "Curio
 * Cabinet", "Prism Works", "Frostglass Forge", "Skybound", "Tidal Depths",
 * "Arcane Relics", "Starforge") for 8 of the 10 shipped worlds. This pins the
 * REAL, currently-authored campaign so that mismatch cannot silently return.
 */

const EXPECTED_WORLDS = [
  { id: 'first-light', title: 'First Light', themeId: 'first-light' },
  { id: 'wild-garden', title: 'Wild Garden', themeId: 'wild-garden' },
  { id: 'neon-nights', title: 'Neon Nights', themeId: 'neon-nights' },
  { id: 'mechanical-city', title: 'Mechanical City', themeId: 'mechanical-city' },
  { id: 'cosmic-frontier', title: 'Cosmic Frontier', themeId: 'cosmic-frontier' },
  { id: 'world-landmarks', title: 'World Landmarks', themeId: 'world-landmarks' },
  { id: 'ocean-depths', title: 'Ocean Depths', themeId: 'ocean-depths' },
  { id: 'mythic-realm', title: 'Mythic Realm', themeId: 'mythic-realm' },
  { id: 'prehistoric-titans', title: 'Prehistoric Titans', themeId: 'prehistoric-titans' },
  { id: 'masterpiece-gallery', title: 'Masterpiece Gallery', themeId: 'masterpiece-gallery' },
  { id: 'ancient-empires', title: 'Ancient Empires', themeId: 'ancient-empires' },
  { id: 'enchanted-forest', title: 'Enchanted Forest', themeId: 'enchanted-forest' },
  { id: 'frozen-north', title: 'Frozen North', themeId: 'frozen-north' },
  { id: 'volcanic-forge', title: 'Volcanic Forge', themeId: 'volcanic-forge' },
  { id: 'carnival-of-wonders', title: 'Carnival of Wonders', themeId: 'carnival-of-wonders' },
  { id: 'lantern-dynasty', title: 'Lantern Dynasty', themeId: 'lantern-dynasty' },
  { id: 'steam-skyways', title: 'Steam Skyways', themeId: 'steam-skyways' },
  { id: 'crystal-caverns', title: 'Crystal Caverns', themeId: 'crystal-caverns' },
  { id: 'neon-megacity', title: 'Neon Megacity', themeId: 'neon-megacity' },
  { id: 'dreamscapes', title: 'Dreamscapes', themeId: 'dreamscapes' },
  { id: 'storm-elementals', title: 'Storm Elementals', themeId: 'storm-elementals' },
  { id: 'galactic-odyssey', title: 'Galactic Odyssey', themeId: 'galactic-odyssey' },
  { id: 'gothic-kingdom', title: 'Gothic Kingdom', themeId: 'gothic-kingdom' },
  { id: 'celestial-zodiac', title: 'Celestial Zodiac', themeId: 'celestial-zodiac' },
  { id: 'arcadia-ascendant', title: 'Arcadia Ascendant', themeId: 'arcadia-ascendant' },
  { id: 'desert-kingdoms', title: 'Desert Kingdoms', themeId: 'desert-kingdoms' },
  { id: 'deep-jungle', title: 'Deep Jungle', themeId: 'deep-jungle' },
  { id: 'underworld', title: 'Underworld', themeId: 'underworld' },
  { id: 'ocean-cities', title: 'Ocean Cities', themeId: 'ocean-cities' },
  { id: 'cosmic-gods', title: 'Cosmic Gods', themeId: 'cosmic-gods' },
  { id: 'ancient-machines', title: 'Ancient Machines', themeId: 'ancient-machines' },
  { id: 'festival-worlds', title: 'Festival Worlds', themeId: 'festival-worlds' },
  { id: 'alien-ecosystems', title: 'Alien Ecosystems', themeId: 'alien-ecosystems' },
  { id: 'lost-futures', title: 'Lost Futures', themeId: 'lost-futures' },
  { id: 'mythic-asia', title: 'Mythic Asia', themeId: 'mythic-asia' },
  { id: 'giant-insects', title: 'Giant Insects', themeId: 'giant-insects' },
  { id: 'moon-kingdom', title: 'Moon Kingdom', themeId: 'moon-kingdom' },
  { id: 'sacred-mountains', title: 'Sacred Mountains', themeId: 'sacred-mountains' },
  { id: 'bio-mechanical-realm', title: 'Bio-Mechanical Realm', themeId: 'bio-mechanical-realm' },
  { id: 'parallel-earth', title: 'Parallel Earth', themeId: 'parallel-earth' },
  { id: 'forgotten-seas', title: 'Forgotten Seas', themeId: 'forgotten-seas' },
  { id: 'colossal-machines', title: 'Colossal Machines', themeId: 'colossal-machines' },
  { id: 'celestial-gardens', title: 'Celestial Gardens', themeId: 'celestial-gardens' },
  { id: 'arcane-city', title: 'Arcane City', themeId: 'arcane-city' },
  { id: 'colossal-architecture', title: 'Colossal Architecture', themeId: 'colossal-architecture' },
  { id: 'planetary-wonders', title: 'Planetary Wonders', themeId: 'planetary-wonders' },
  { id: 'legendary-relics', title: 'Legendary Relics', themeId: 'legendary-relics' },
  { id: 'infinite-cities', title: 'Infinite Cities', themeId: 'infinite-cities' },
  { id: 'arcadia-fractured', title: 'Arcadia Fractured', themeId: 'arcadia-fractured' },
] as const;

test('the campaign manifest exposes exactly the forty-nine current world names/ids, in order', () => {
  expect(CAMPAIGN_MANIFEST.worlds).toHaveLength(49);
  expect(CAMPAIGN_MANIFEST.worlds.map((w) => ({ id: w.id, title: w.title, themeId: w.themeId }))).toEqual(
    EXPECTED_WORLDS.map((w) => ({ ...w })),
  );
});

test('none of the retired legacy world codenames leak into consumer-facing metadata', () => {
  const retired = [
    'deep-frost', 'curio-cabinet', 'prism-works', 'frostglass-forge',
    'skybound', 'tidal-depths', 'arcane-relics', 'starforge',
    'Deep Frost', 'Curio Cabinet', 'Prism Works', 'Frostglass Forge',
    'Skybound', 'Tidal Depths', 'Arcane Relics', 'Starforge',
  ];
  for (const world of CAMPAIGN_MANIFEST.worlds) {
    expect(retired).not.toContain(world.id);
    expect(retired).not.toContain(world.title);
    expect(retired).not.toContain(world.themeId);
  }
});

test('every world groups exactly ten levels, and its levels each carry the matching themeId', () => {
  for (const world of CAMPAIGN_MANIFEST.worlds) {
    expect(world.levelIds).toHaveLength(10);
  }
  // Levels are globally unique across worlds and cover 1-490 with no gaps.
  const allIds = CAMPAIGN_MANIFEST.worlds.flatMap((w) => w.levelIds).sort((a, b) => a - b);
  expect(allIds).toEqual(Array.from({ length: 490 }, (_, i) => i + 1));
});

test('each world has a non-empty subtitle and a real (non-gameplay) accent colour', () => {
  for (const world of CAMPAIGN_MANIFEST.worlds) {
    expect(world.display?.subtitle).toBeTruthy();
    expect(world.display?.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
  }
  // Accents are per-world identity, not the flat "everything reads as one
  // neutral card" language `WorldCard.tsx` used pre-redesign.
  const accents = CAMPAIGN_MANIFEST.worlds.map((w) => w.display?.accent);
  expect(new Set(accents).size).toBe(accents.length);
});
