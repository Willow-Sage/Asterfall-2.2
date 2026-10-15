# Asterfall 2.3 — The Living Barony

**Playable Serenova orchard-to-market vertical slice.** Browser-based 3D settlement life simulation, built in React / React Three Fiber / Three.js. Preserves the existing NPC Studio as a separate tab. The Asterfall 2.1 repository is untouched.

## Play the vertical slice

Start outside the Serenova manor, near Eliana the estate steward. Press **E** to accept the granary commission. Go west to the citrus grove and pick six fruit; collect three timber pieces from the forester's woodpile; visit Lucien's carpenter workshop to turn timber into a crate; carry six citrus and one crate to the granary. The delivery visibly stocks the market, awards crowns, builds Commerce XP and earns renown. Visit Mireya at the market to buy locally made citrus honey, then speak to Eliana again to begin a new day. Each day regenerates the grove and supplies.

**Controls:** WASD / arrow keys to move, hold Shift to run, drag to rotate camera, scroll to zoom, E or click interaction prompt to interact, I to open pouch, J for journal, M for map, Escape to close panels. Touch-screen movement and interaction buttons are provided.

**Persistent progress:** Saved locally in the browser with a versioned key (`asterfall-2.3-serenova-save`). Separate computers and browsers do not share saves. This is a single-player vertical slice, **not** an MMO backend.

## Current visual scope

The landscape, terracotta-roof buildings, harvestable citrus grove, market stock and characters are temporary in-engine meshes that demonstrate scene composition and gameplay. The characters reuse the earlier Asterfall NPC mesh code, not the approved Cloudbound Gardener production rig. These models **do not** satisfy the final stylized anime art gate. No paid/source-only pack has been republished without a license review; see `docs/ASSET_REQUIREMENTS.md`, `docs/ASSET_LICENSES.md`, and `docs/NPC_STUDIO.md`.

## Structure

- `src/game/sim.ts` — saveable, independent economic/quest simulation and orchard-to-market transitions
- `src/game/SerenovaScene.tsx` — third-person controller and 3D world composition
- `src/game/SerenovaGame.tsx` — HUD, map, inventory, journal, interactions and save orchestration
- `src/game/serenova.css` — low-chrome responsive game UI
- `src/npc/*` — original NPC Studio generator/export workflows remain available

## Build and deployment

Install Node 22; `npm install && npm run build`. Start locally with `npm run dev`. GitHub Pages Actions deploys the `dist` output from `main` when enabled under repository Settings → Pages → Source: GitHub Actions. Hosting retains the existing repository path and Vite base `/Asterfall-2.2/`, even though the **game version** is 2.3. Check the Pages workflow before treating a commit as live.

## Acceptance checks

1. Talk to Eliana; objective becomes citrus harvest.
2. Harvest fruit from trees until pouch contains six citrus; confirm fruit visually disappear as they are picked.
3. Gather timber at the woodpile and craft one crate at the workshop; confirm XP and ingredient consumption.
4. Deliver to the granary; confirm payout, objective reset, stock displayed at the market stall, and ledger counters.
5. Buy honey at market; restart the page and confirm saved items, renown, granary stores, market stock and character position.
6. Speak to Eliana again to start a new day; confirm grove and timber regenerate; NPC Studio still launches.

Not yet included: server-authoritative multiplayer, detailed skeletal animation, cloud saves, approved production-quality anime character assets, authored 3D architecture, and the wider duchies.