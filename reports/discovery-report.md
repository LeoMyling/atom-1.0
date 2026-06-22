# Discovery Report

## Task

- Source URL / evidence: `https://www.thefoundation.house/`; captured 2026-06-22 with `capture_assets.py` across `/`, `/apply`, `/battalion-tpo`, `/careers`, `/contact`, and `/programs`.
- Mode: `Static Mirror`
- Permission context (user-stated): "I have permission to Mirror https://www.thefoundation.house/"
- Scope Classification: `Multi-Route Site`

## Stack & Architecture

- Framework / build: Webflow static export/runtime (`data-wf-site="66f603e5069e2b5cc1f8ec86"`), published April 6, 2025 according to the live HTML comment.
- Styling architecture: external Webflow CSS at `cdn.prod.website-files.com/.../css/battalion-somefolk.webflow.0dfdeb3af.css`, plus inline Webflow interaction styles.
- Animation system(s): Webflow IX2, GSAP + ScrollTrigger, Lenis smooth scrolling, Lottie/Webflow background video, Vimeo background embeds, and a custom WebGL app.
- Routing structure: document routes for `/`, `/apply`, `/careers`, `/contact`, and `/programs`; discovered same-site `/battalion-tpo` returns a source-side 404.
- Asset pipeline / CDN: Webflow CDN for CSS, JS, images, fonts, JSON/Lottie, and videos; jsDelivr/CDNJS for scripts; Vimeo/player streams; Cloudflare Turnstile on form flows.
- Existing repo? Active branch: no local git repository in this workspace.

## Design System (measured, not estimated)

- Typography: body fallback is `Arial, "Helvetica Neue", Helvetica, sans-serif` at 16px/20px; hero and buttons use `"Helvetica Now Display", sans-serif`.
- Type scale: measured desktop `.hero-title` 158.4px / 158.4px, weight 700; measured desktop `h1` 25.6px / 24.32px, weight 400.
- Color values: body text `rgb(51, 51, 51)`; primary hero text `rgb(255, 255, 255)`; dark button background `rgb(43, 43, 43)`; page background `rgb(255, 255, 255)`.
- Spacing system: Webflow class-driven responsive layout using viewport and em units; detailed values live in external Webflow CSS.
- Breakpoints / responsive behavior: desktop, tablet, and mobile screenshots generated; separate mobile menu/logo/map variants are present.

## Module Trigger Scan

| Trigger | Detected? (Yes / Suspected / No) | Module activated |
| --- | --- | --- |
| WebGL / canvas / 3D | Yes; `cdn.jsdelivr.net/gh/kujira22/kujira_webgl@main/Battalion/13/app.js` and `Foundation2.glb` | `modules/webgl.md` |
| Audio | No | none |
| Video | Yes; Webflow background videos and Vimeo/progressive streams | `modules/video.md` |
| Multiple routes | Yes; five working routes plus one broken same-site route | `modules/multi-route.md` |
| Runtime-loaded assets | Yes; 66 unique responses were first seen after scroll in the merged capture | `modules/runtime-assets.md` |

## Link & Route Inventory

| Link / route | Status | Structured content on target? |
| --- | --- | --- |
| `/` | Recreated locally in `mirror/index.html` | Homepage modules, offers, map, process, tech, footer |
| `/#about` | Local hash link in homepage document | About/overview content |
| `/#offerings` | Local hash link in homepage document | Offering cards |
| `/#approach` | Local hash link in homepage document | Process/approach content |
| `/#tech` | Local hash link in homepage document | Tech-powered section |
| `#clients` | Local hash link in homepage document | Client/state coverage section |
| `/apply` | Recreated locally in `mirror/apply/index.html` | Application form with Cloudflare Turnstile dependency |
| `/careers` | Recreated locally in `mirror/careers/index.html` | Vacancy listings |
| `/contact` | Recreated locally in `mirror/contact/index.html` | Contact form/content |
| `/programs` | Recreated locally in `mirror/programs/index.html` | Program/loan offering sections |
| `/battalion-tpo` | Source-side 404; not downloaded as a working route | Unknown/unavailable |
| `mailto:info@thefoundation.house` | Live external mail action | n/a |
| `tel:(718)309-3000` | Live external phone action | n/a |

## Source Module Inventory (source order)

| # | Module | Type | Visibility conditions | Validation status |
| --- | --- | --- | --- | --- |
| 1 | Loader / logo animation | Webflow animation + video/Lottie | Initial load | Present locally; external assets live |
| 2 | Global nav and mobile menu | Navigation | Desktop/mobile variants | Present locally |
| 3 | Homepage hero | WebGL/canvas + overlay content + CTA | First viewport | First-viewport local/source screenshots match |
| 4 | Effortless capital / metrics | Text and stat cards | Homepage after hero | Present in full-page local screenshot |
| 5 | Offerings | Product cards and rendered property imagery | Homepage scroll | Present in full-page local screenshot |
| 6 | Testimonials / quote cards | Static content cards | Homepage scroll | Present in full-page local screenshot |
| 7 | US coverage map | State SVG grid + mobile map | Desktop/mobile variants | Present in full-page local/mobile screenshots |
| 8 | Next-Gen Financing | Text, imagery, numbered rows | Homepage scroll | Present in full-page local screenshot |
| 9 | Process | Split section with CTA image | Homepage scroll | Present in full-page local screenshot |
| 10 | Tech Powered | Dark image/video section | Homepage scroll | Present in full-page local screenshot |
| 11 | Footer | Contact, nav, final CTA, legal | All working routes | Present locally |
| 12 | Apply | Application page/form | `/apply` | Browser route validation passed |
| 13 | Careers | Vacancy listing | `/careers` | Browser route validation passed |
| 14 | Contact | Contact page/form | `/contact` | Browser route validation passed |
| 15 | Programs | Loan program content | `/programs` | Browser route validation found provider 401s also seen in capture |

## Asset Graph (Static Mirror Mode)

- `capture_assets.py` output files: `asset-graph.json`, `asset-graph-apply.json`, `asset-graph-battalion-tpo.json`, `asset-graph-careers.json`, `asset-graph-contact.json`, `asset-graph-programs.json`, merged into `asset-graph-merged.json`.
- Same-origin assets: 6 captured same-origin responses; 5 downloaded route documents.
- External providers detected: Webflow CDN, jsDelivr, CDNJS, Cloudfront jQuery, raw.githubusercontent.com, Vimeo, Cloudflare Turnstile.
- Blocked / unresolved: Vimeo/provider-streamed media not localized; Cloudflare challenge/Turnstile requests are live external; `/battalion-tpo` is a live 404.

## Deep Discovery Sources (Static Mirror Mode)

- Repo / source link found: no source repo link found in captured HTML.
- Probe URLs checked: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/asset-manifest.json`, `/.vite/manifest.json`, `/_next/build-manifest.json`, `/package.json`; all returned 404 Webflow HTML bodies.
- Sitemap / routes found: no sitemap; route inventory came from anchor capture and live route checks.
- Manifest files found: none.
- Source maps found: not checked beyond deployed probes; not needed for first-render static mirror.
- Bundle scan findings: custom WebGL app requests `Foundation2.glb` from `raw.githubusercontent.com`; GSAP/ScrollTrigger and Lenis scripts are external.
- Runtime interaction capture performed: scroll capture and route browser validation performed; click/form submission not performed.
- Missing assets found from local server 404 logs: no missing local asset failures on five working routes when internet/external assets are available.

## Findings

### Facts

- The local mirror is in `mirror/` and contains five working route documents.
- The mirror is online-dependent because most runtime assets are external and were not localized.
- The local and live homepage first viewport matched in no-scroll desktop screenshots.
- Browser validation found no failed requests on `/`, `/apply`, `/careers`, or `/contact`; `/programs` produced Vimeo/Cloudflare 401s.
- The live `/battalion-tpo` route returns 404.

### Assumptions

- User permission covers same-origin route mirroring.
- External Webflow/CDN assets are kept live unless the user separately confirms host-specific permission and licensing for localization.

### Unknowns

- Whether the user wants a fully offline/self-contained version.
- Whether the Vimeo videos can be supplied as original files or should remain provider embeds.
- Whether `/battalion-tpo` should be repaired, removed, or intentionally left as a broken source link.
