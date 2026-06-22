# Implementation Plan

## Component Hierarchy

- Static mirror root: `mirror/`
- Working route documents:
  - `mirror/index.html`
  - `mirror/apply/index.html`
  - `mirror/careers/index.html`
  - `mirror/contact/index.html`
  - `mirror/programs/index.html`
- Audit trail: `mirror/mirror-manifest.json`
- Evidence and reports:
  - `asset-graph*.json`
  - `validation-shots/`
  - `reports/`

## File Structure

- Keep generated mirror output under `mirror/`.
- Keep discovery, validation, and asset-classification docs under `reports/`.
- Do not hand-edit captured route HTML unless explicitly moving into an editable recreation phase or an offline-localization pass.

## Implementation Sequence Completed

1. Runtime-captured homepage and linked routes with `capture_assets.py`.
2. Merged capture graphs into `asset-graph-merged.json`.
3. Mirrored authorized same-origin route documents with `mirror_assets.py`.
4. Served the mirror locally with `serve.py` on port `8012`.
5. Validated homepage first viewport and five local routes in Chromium.

## Safe Change Boundary

- Completed work is a static Webflow runtime capture, not an editable redesign.
- External assets remain live references; no proprietary/provider media was downloaded.
- No source route was invented for `/battalion-tpo` because the live source returns 404.

## Asset Preservation Plan

- Current tier: keep external assets live and preserve deployed runtime behavior.
- Optional next tier: after host-specific authorization, download non-provider external assets and rewrite references for offline use.
- Vimeo/provider-streamed media should remain embedded or be replaced only with user-supplied original files.

## Partial-Completion Boundaries

- Complete for: first-render online-dependent local mirror of the five working routes.
- Not complete for: offline/self-contained mirror, editable source recreation, form submission verification, and repairing `/battalion-tpo`.

## Motion Stack

- Preserve existing Webflow IX2 + GSAP + Lenis + WebGL runtime for this static mirror.
- GSAP + ScrollTrigger is already present in the source; Framer Motion is not part of this mirror.
