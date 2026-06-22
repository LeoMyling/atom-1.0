# Asset Preservation Table

| Asset | Source (URL / code path) | Status | Strategy & why alternatives were rejected | Fidelity impact |
| --- | --- | --- | --- | --- |
| Route HTML | `https://www.thefoundation.house/`, `/apply`, `/careers`, `/contact`, `/programs` | `Local Copy` | Downloaded with `mirror_assets.py` after user-stated permission. | Core route documents are local. |
| `/battalion-tpo` route | `https://www.thefoundation.house/battalion-tpo` | `Blocked` | Live source returns 404; no working page to preserve. | Same-site link is broken in source; local file is intentionally absent. |
| Webflow CSS/JS/images/fonts/JSON/video assets | `https://cdn.prod.website-files.com/66f603e5069e2b5cc1f8ec86/...` | `Kept External` | Major visual assets and Webflow runtime are external. Not localized without host-specific permission/licensing confirmation and URL rewrite pass. | Mirror requires internet access for full fidelity. |
| Webflow jQuery | `https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min...` | `Kept External` | Runtime dependency kept live; no local rewrite pass performed. | Mirror requires internet access. |
| GSAP + ScrollTrigger | `https://cdnjs.cloudflare.com/ajax/libs/gsap/...` | `Kept External` | External library kept live. | Animations require internet access. |
| Lenis smooth scroll | `https://cdn.jsdelivr.net/gh/studio-freight/lenis@v0.2.26/bundled/lenis.js` | `Kept External` | External library kept live. | Smooth scrolling requires internet access. |
| Finsweet number count / validation scripts | `https://cdn.jsdelivr.net/...` | `Kept External` | External scripts kept live. | Number/form behaviors require internet access. |
| Custom WebGL app | `https://cdn.jsdelivr.net/gh/kujira22/kujira_webgl@main/Battalion/13/app.js` | `Kept External` | WebGL source preserved as the deployed external script; not rewritten/localized in this pass. | WebGL requires internet access. |
| WebGL model | `https://raw.githubusercontent.com/kujira22/kujira_webgl/master/Battalion/Foundation2.glb` | `Kept External` | Runtime-loaded GLB kept live; no local rewrite pass performed. | Hero 3D scene requires internet access. |
| Vimeo/player background media | `https://player.vimeo.com/...`, `https://download-video-ak.vimeocdn.com/...` | `Embed` | Provider-streamed media is never auto-downloaded. Embed/player behavior is preserved where provider allows. | Some Vimeo requests return 401; source/provider behavior must be accepted or replaced with user-supplied video. |
| Cloudflare Turnstile/challenge | `https://challenges.cloudflare.com/...` | `Kept External` | Security/form challenge provider must remain live. | Forms may depend on live Cloudflare behavior. |

## Approvals needed

- Confirm whether to localize non-provider external hosts: `cdn.prod.website-files.com`, `d3e54v103j8qbb.cloudfront.net`, `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, and `raw.githubusercontent.com`.
- Provide or approve replacement originals if Vimeo media should be self-hosted instead of embedded/provider-loaded.
- Decide whether `/battalion-tpo` should remain source-broken, be removed from navigation, or be supplied/recreated.
