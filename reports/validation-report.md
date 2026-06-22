# Validation Report

## Per-section checks

| Section / route | Desktop | Tablet | Mobile | Scroll behavior | Animation timing | Interaction states | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` homepage first viewport | Pass; no-scroll local/source screenshots match | Screenshot generated | Screenshot generated | Full-page helper disturbed desktop hero after scroll, but direct first-viewport check passed | WebGL loop and Webflow runtime active | CTAs/nav visible | Pass for online first render |
| `/apply` | Browser route validation passed | Not individually screenshot | Not individually screenshot | Not exhaustively tested | Runtime loaded | Form submit not tested | Pass with external dependencies |
| `/careers` | Browser route validation passed | Not individually screenshot | Not individually screenshot | Not exhaustively tested | Runtime loaded | Mail links present | Pass with external dependencies |
| `/contact` | Browser route validation passed | Not individually screenshot | Not individually screenshot | Not exhaustively tested | Runtime loaded | Form submit not tested | Pass with external dependencies |
| `/programs` | Browser route validation rendered page | Not individually screenshot | Not individually screenshot | Not exhaustively tested | Runtime loaded | Hash links present | Fidelity Gap: provider 401s observed |
| `/battalion-tpo` | Source 404; no local file | n/a | n/a | n/a | n/a | n/a | Fidelity Gap/source issue |

## Global checks

- [x] Typography measured from rendered DOM.
- [x] Spacing and layout visually checked for homepage first viewport and full local screenshots.
- [x] Working same-site routes resolve locally as files.
- [x] Structured modules identified for homepage, programs, careers, apply, and contact.
- [x] No failed requests on `/`, `/apply`, `/careers`, `/contact` in online browser validation.
- [ ] No provider failures on every route; `/programs` produced Vimeo and Cloudflare 401s.
- [ ] Offline completeness; external CDN/provider assets remain live.
- [x] Active module validation performed for WebGL/video/runtime at first-render level.
- [x] Asset Preservation Table statuses recorded.

## Static Mirror audit

- Acceptance tier reached: `First-render mirror`
- Deep Static Mirror Discovery passed: no. Completed route capture, probes, local server validation, and first-viewport screenshots. Remaining: host-authorized asset localization, offline validation, exhaustive interaction/form validation, and provider media decision.
- Asset count: merged graph 152 unique responses; 5 files downloaded into `mirror/`.
- Total folder size: `mirror/` 348K; `validation-shots/` 63M.
- Missing files: no missing local asset files on five working routes with internet access; `/battalion-tpo/index.html` intentionally absent because source returns 404.
- Remaining external requests: critical Webflow CDN, WebGL script/model, GSAP/Lenis/Finsweet/jQuery, Vimeo media/player, Cloudflare Turnstile/challenge.
- Known fallbacks / stubs: none added.
- Practically editable: no; this is captured Webflow HTML with minified external runtime dependencies.

## Fidelity Gaps

| Feature | What's missing / downgraded | Blocking technology | Available paths | User response |
| --- | --- | --- | --- | --- |
| Offline completeness | External assets are not localized or rewritten | External CDN/provider assets | Confirm host-specific permission and run localization/rewrite pass; or keep online-dependent mirror | Pending |
| Vimeo media | Provider media not downloaded; `/programs` shows Vimeo 401 during validation | Vimeo/provider streaming restrictions | Keep embed, supply originals, or approve replacement strategy | Pending |
| `/battalion-tpo` | Linked same-site route returns 404 in source and has no local file | Missing source route | Leave as source-broken, remove link, or supply/recreate content | Pending |
| Full-page screenshot helper | Desktop full-page helper produced a blank hero after scroll on local capture | Scroll/animation state interaction with screenshot helper | Use direct first-viewport screenshot for hero validation; run manual scroll QA for final offline tier | Acknowledged in report |

## Project status

`Partial Completion`

- Completed: authorized first-render static mirror of five working routes; local preview server; capture graphs; audit manifest; screenshots; reports.
- Blocked: offline localization and provider media require explicit host/media decisions.
- Approximated (approved): none.
- Not Yet Implemented: self-contained offline mirror, editable recreation, `/battalion-tpo` repair, form submission QA.
