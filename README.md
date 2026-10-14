# Asterfall 2.2: The Living Realms

Independent browser project for Serenova, Terravelle and Solterra. **Asterfall 2.1 is untouched.**

## NPC Studio — available in the web interface

The new NPC Studio generates a population of actual renderable 3D character mesh actors (prototype art), with a separate family and NPC JSON asset registry.

- Every household has **2–6 members**; generated populations average **exactly 4**. Parent/child/grandparent ages and reciprocal kinship links are validated.
- Names, identities, Solterran profession and core skill, appearance parameters, daily schedules, household IDs, and social traits are preserved in exportable JSON.
- Characters are instantiated as 3D Three.js meshes in the interactive studio preview. **Export selected 3D meshes as .glb**, or export the entire village roster as JSON.
- A population spawning component has been added to the village rendering pipeline and awaits a reviewed village asset and real navigation anchors.
- Talk and gift relationship progression is currently a local-session demonstration. Persistent and authoritative multiplayer relationship storage remains to be implemented.

**Visual limitations:** Generated mesh bodies are **concept-quality provisional anime-inspired meshes**, not finished Cloudbound Gardener-level character art. Exported GLB meshes are currently static, and runtime pivot movement is not a proper skinned humanoid idle/walk/run rig. This feature must **not** be marked as having achieved the final anime-character art gate.

See [NPC Studio design and acceptance criteria](docs/NPC_STUDIO.md).

## Current world-development status

Initial TypeScript/React/Vite modular foundation and gated environment inspection viewport. No approved authored Solterran village model, complete gameplay, physics/navigation, or multiplayer backend are implemented in this repository.

## Development

Use Node 22. Run `npm install`, `npm run dev`, and `npm run build`.

## Art gate

See `docs/ASSET_REQUIREMENTS.md` and `docs/ASSET_LICENSES.md`. Register reviewed GLB character models and approved village models in `src/assets/manifest.ts` and place distributable files in `public/`. The current viewport is not a third-person player controller.

## Deployment

GitHub Pages from the existing workflow, if configured. Configure Settings → Pages → Source: GitHub Actions. Vite base should be `/Asterfall-2.2/`. **Committing code is not proof that a Pages build or deployment succeeded.**
