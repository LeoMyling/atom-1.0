# Nomada Toast — site mirror

A static mirror of the Webflow-built site originally at
`https://www.thefoundation.house/`, rebranded as **Nomada Toast** (a luxury
interior-design studio). The homepage adds a bespoke, scroll-driven story
experience with a custom WebGL "water reveal" hero effect on top of the
captured Webflow runtime.

GitHub: [LeoMyling/atom-1.0](https://github.com/LeoMyling/atom-1.0)

## Running locally

The site is fully static — serve the `mirror/` directory with any static file
server. The established port is **8012**:

```bash
python3 -m http.server 8012 --directory mirror
# then open http://127.0.0.1:8012/
```

This command is also saved in [`.claude/launch.json`](.claude/launch.json) as
the `nomada-toast-mirror` dev-server config.

> Note: the mirror keeps most heavy assets (Webflow CDN, fonts, GSAP, Lenis,
> Vimeo) as **live external references**, so full fidelity requires an internet
> connection. The custom story/hero assets are local under `mirror/`.

## Repository structure

| Path | Purpose |
| --- | --- |
| `mirror/` | **The actual website.** Static, deployable output (see below). |
| `Atom Assets 1.0/` | **Source media** — raw videos/images/logo the story assets were derived from. Not served by the site. |
| `reports/` | **Audit & planning docs** from the mirroring process (discovery, plan, asset preservation, animation audit, validation). |
| `validation-shots/` | **QA screenshots** comparing the local mirror against the live source across viewports. |
| `asset-graph*.json` | **Generated analysis files** — captured request/asset graphs per route plus a merged graph. |
| `.claude/` | Tooling config (e.g. `launch.json` dev-server definition). |

### `mirror/` (the website)

| Path | Purpose |
| --- | --- |
| `index.html` | Homepage. Hosts the custom story flow + WebGL hero "water reveal" effect. |
| `apply/`, `careers/`, `contact/`, `programs/` | The other captured routes (each an `index.html`). |
| `story-flow.js` | Custom homepage logic: scroll-driven chapter transitions and the self-contained WebGL fluid hero reveal. |
| `story-flow.css` | Styles for the story flow and hero layers. |
| `nomada-toast.webflow.css` | The captured Webflow stylesheet. |
| `story-assets/` | Homepage media — chapter transition videos, story-point images, hero stills. |
| `brand-assets/` | Nomada Toast logo, favicon, web-clip. |
| `mirror-manifest.json` | Audit manifest of what was captured vs. kept external during mirroring. |

## Notes for contributors

- The homepage hero effect lives entirely in `mirror/story-flow.js`
  (`createHeroFluid`) and `mirror/story-flow.css`. When the story is active,
  `story-flow.css` force-hides hero `<canvas>` elements — any new hero canvas
  must be excluded from that rule or it will render invisibly.
- `mirror/index.html` cache-busts `story-flow.{css,js}` with a `?v=` query
  string; bump it when changing those files so browsers reload them.
- Don't rename or move media assets without updating the references in the
  route HTML and `story-flow.js`.
