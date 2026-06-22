# Animation Audit

| # | Element / section | Trigger | Duration | Easing | Delay | Start state | End state | Transforms / opacity | Parallax / pin / scrub | Sequencing | Asset or module |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Loader / logo | Initial page load | Webflow-defined | Webflow-defined | Initial | Loader visible | Main page visible | Opacity/display transitions | No | Before hero | Webflow IX2, video/Lottie |
| 2 | Hero WebGL/property scene | Initial load and runtime loop | Continuous | WebGL runtime-defined | After model load | Canvas initializes | Animated scene running | Canvas/WebGL camera/render loop | No explicit scroll coupling observed | Runs behind hero content | WebGL module, `Foundation2.glb` |
| 3 | Hero text/card layout | Initial load | Webflow/GSAP-defined | Webflow/GSAP-defined | After load | Hero content composed over scene | Visible first viewport | Opacity/position effects from Webflow inline styles | No | Hero after loader | Webflow IX2 + GSAP |
| 4 | Smooth scrolling | Scroll | Continuous | Lenis-defined | n/a | Native scroll input | Smoothed page motion | Transform/scroll interpolation | Yes, whole page scroll smoothing | Site-wide | Lenis |
| 5 | Offering cards and stat sections | Scroll into view | Webflow-defined | Webflow-defined | Section-based | Hidden/translated elements | Visible cards/images | Opacity and translate values in Webflow styles | Some scroll-triggered reveal behavior | Sequential by section | Webflow IX2, images |
| 6 | State map / coverage graphics | Scroll into view | Webflow-defined | Webflow-defined | Section-based | Lazy images unloaded/offscreen | SVG grid/mobile map visible | Lazy loading and reveal | No | After testimonials | Webflow assets |
| 7 | Process CTA | Scroll/hover | Webflow-defined | Webflow-defined | Section-based | CTA/image static | Hover/scroll states visible | Arrow and CTA transforms | No | Process section | Webflow IX2 |
| 8 | Tech Powered video/background section | Scroll into view | Video/provider-defined | n/a | On render | Media not yet active/offscreen | Media visible/moving | Video object-fit/crop | No | Near footer | Video module |
| 9 | Button arrows/menu | Hover/click | Webflow-defined | Webflow-defined | Immediate | Default arrow/menu state | Arrow/menu transition | Translate/rotate/opacity | No | Interaction-triggered | Webflow IX2 |

## Motion system conclusion

- Framer Motion sufficient? No. This is a preserved static runtime with Webflow IX2, GSAP + ScrollTrigger, Lenis, provider media, and WebGL. Rebuilding editably would require a dedicated recreation plan.
- Shared motion config values: Unknown without deeper reverse-engineering of Webflow IX2 data and external scripts.
