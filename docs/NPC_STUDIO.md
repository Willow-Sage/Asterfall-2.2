# Asterfall 2.2 — NPC Studio and village population

Status: functional **character data generator and preview/export prototype**, not final art approval, production animation, navigation, or multiplayer.

## Household constraints

- Every generated household has between **2 and 6 people**, inclusive.
- For generated village populations, the arithmetic mean is **exactly 4 people/household**; the distribution is created from mirrored household-size pairs around four.
- All households are family-linked: two parents, single parent, three generations, or siblings with children. Couples and adult siblings can comprise a two-person home.
- Parents are always at least 18 years older than their children; grandparents at least 36 years older than grandchildren.
- Spouses/partners and family links are reciprocal; people share `householdId`, not only a surname.
- People under 18 cannot have an adult profession or romance flag, and follow school/chores/play schedules. They use age-scaled 3D character meshes.
- Family templates deliberately favor homes with children and intergenerational living, rather than lone villagers.

## Game asset pipeline

The Studio now generates **two complementary types of asset**:

1. **NPC JSON population pack**: stable NPC and household IDs, names, identity, ages, professions, classless core skills, ambition, kinship links, cosmetics, and location-keyed daily routines.
2. **3D `.glb` geometry for a selected resident**: exported from an actual Three.js scene hierarchy, with visible hair, facial features and Solterran-inspired clothing variations. The same geometry is instantiated by `NpcPreview` and `NpcPopulation`. It is concept-quality placeholder art, not an approved final light-novel/anime character asset. GLB exports are **static**; runtime-only limb pivot movement is not exported as skeletal animation clips.

`src/npc/NpcWorld.tsx` bridges the exported data to world actors. `src/rendering/VisualScene.tsx` mounts the population in the existing scene when a reviewed village model is available. The sample anchors are **not** yet connected to a village navmesh: location transitions use provisional positions. Do not count this as a production NPC navigation system.

To replace the provisional art with supplied library models, assemble an appropriate base avatar + clothing, verify the skeleton and animation retargeting, and register an approved model in `src/assets/manifest.ts`. The bundled Quaternius outfits are clothing parts, not standalone complete characters; the Universal Animation Library provides animation source clips, but neither automatically rigs the assembled NPC. A Cloudbound-quality authored/rigged character should remain the final art target.

## Shared multiplayer state boundary

`NpcPack` is a world-owned shared state. A player must not write their friendship scores into it.

`PlayerNpcRelationship` is keyed to both `playerId` and `npcId`, and stores personal relationship points, last daily conversation/gift, and story flags. NPC Studio currently simulates one local session: **no persistent cloud state or multi-account synchronization exists yet**.

In a multiplayer implementation, the authoritative server should own canonical NPC IDs, schedules, plot/location anchors, shared profession economic output, and death/migration events. It should store individual player's social progress separately and ensure gift/action limits are validated server-side.

## Acceptance and validation

`validatePack` rejects broken household sizes, missing or mismatched family IDs, age-stage violations, underage profession/romance flags, nonreciprocal family links, and invalid parent/grandparent age gaps.

The generator was exercised across **3,000 seed/household-count combinations** (200 seeds × 15 household counts) with zero validation errors. This checks demographic constraints, not 3D runtime correctness or browser deployment.

Follow-on acceptance: Vite TypeScript build, Firefox/Chrome rendering, real GLB asset export/loading, FPS at 20+ NPCs, proper pathfinding/navigation, persistent multiplayer friends, and final anime art approval.