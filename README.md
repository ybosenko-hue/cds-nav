# CDS Navigation Prototype

Pixel-perfect prototype of the Crusoe **CDS Navigation — May 27 Final** Figma:
[`Crusoe Design System → Navigation - May 27 Final revision`](https://www.figma.com/design/Ddl1SvLNSOJlp3dcIsql9i/Crusoe-Design-System--CDS-?node-id=19577-131).

Live: **https://YBosenko.github.io/cds-nav/** _(replace `YBosenko` with your GitHub username once Pages is enabled)_

## What's inside

A single dark-theme React component (`src/CdsNavPrototype.tsx`) that renders the
full integrated left-rail shell with these wired interactions:

| # | Interaction | Anchor |
|---|---|---|
| 1 | Hover state on every left-nav item | CSS-driven |
| 2 | Clicking a section updates the page title | inline |
| 3 | Click **John Doe** → profile dropdown | floats above the avatar |
| 4 | Profile tiles switch the shell (Cloud ↔ Foundry) | Foundry adds *Model Hub*, *Model Development*, *Model Deployments*, and the *Get API Key* pill |
| 5 | Click the **bell** → notifications tray | anchored to the right of the rail (Operations / Health / Account / Maintenance / Support tabs) |
| 6 | Click **Staging** → project selector | search + Prod / Staging / Test + *Manage projects* |
| 7 | Click **Admin** from any page → admin shell with *Back to app* | remembers the last visited app and returns to it |

## Local dev

```bash
npm install
npm run dev      # http://localhost:6011
```

## Build

```bash
npm run build    # writes static bundle to dist/
npm run preview  # serves dist/ locally
```

## Deploying to GitHub Pages

1. Push to `main` — `.github/workflows/deploy.yml` builds the bundle and publishes it via Pages.
2. In the repo settings → **Pages**, set **Source = GitHub Actions**.
3. The site is served from `https://<owner>.github.io/cds-nav/`.

The Vite `base` is already set to `/cds-nav/` to match. For other hosts, run
`VITE_BASE=/ npm run build`.

## Design tokens

All colors, spacing, and radii are exposed as CSS custom properties (`--cds-*`)
inside `CdsNavPrototype.tsx`. They map 1-to-1 to the Figma variables on
node `19577:131`.

## Tech

React 18 + TypeScript + Vite + `@emotion/styled` + `@carbon/icons-react`. No
private dependencies, no runtime services — fully static.
