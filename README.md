# Asterfall 2.2: The Living Realms

New independent browser project for Serenova, Terravelle, Solterra. Asterfall 2.1 is untouched.

## Current status

Initial TypeScript/React/Vite modular foundation and gated environment inspection viewport. No playable character, animation controller, physics integration, gameplay, or multiplayer is implemented. No model assets are included. The asset requirement screen deliberately avoids substituting primitive figures for the approved anime direction.

## Development

Use Node 22. Run `npm install`, `npm run dev`, and `npm run build`.

## Art gate

See docs/ASSET_REQUIREMENTS.md and docs/ASSET_LICENSES.md. Register reviewed models in src/assets/manifest.ts and put distributable files in public/. The current viewport loads a village GLB for inspection only; it is not a third-person game controller.

## Deployment

GitHub Actions builds and deploys Pages. Configure Settings → Pages → Source: GitHub Actions. Vite base is /Asterfall-2.2/. A workflow commit is not proof that deployment succeeded.
