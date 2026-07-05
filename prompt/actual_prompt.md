Build a single-page EV car showcase website. Before writing any code, inspect the /reference folder — it contains HTML, CSS, and JS files with a working GSAP scroll animation setup. Study how the scroll-trigger and rotation logic is structured there and reuse/extend that pattern rather than writing a new animation system from scratch.

LAYOUT REFERENCE (see attached screenshot)
Recreate this composition style, not a generic hero section:
- The 3D car model sits center-stage, large, filling most of the viewport width
- A massive, bold display headline (the car/model name) sits BEHIND the car model — the model overlaps and partially covers the text, creating depth. Text z-index is below the model, model z-index is above.
- Top navbar is minimal and transparent/overlaid on the hero: hamburger/menu icon left, small centered logo/badge, search + grid icon right
- Left side: a vertical list of model variants/trims (e.g. different versions), with the active one bold/highlighted and inactive ones dimmed — matches the "LIBERTY 50 / LIBERTY 150 / LIBERTY 150 SPORT" pattern in the reference
- Right side: a vertical rotation indicator (0° to 360°) with a draggable dot on a thin line, showing current rotation angle as the user scrolls or drags
- Background: soft neutral gradient (light gray to white, or dark charcoal to black for our EV — pick ONE, don't mix warm and cool tones)

3D MODEL BEHAVIOR
- Load the .glb model (Three.js / React Three Fiber via GLTFLoader or useGLTF)
- As the user scrolls, the model rotates smoothly on its Y-axis, tied directly to scroll position (not autoplay, not on a timer — scroll position drives rotation angle, same logic as the reference GSAP files)
- The right-side 0°–360° indicator dot updates in real time to reflect current rotation
- Model should feel "pinned" in the viewport while background/text content changes behind and around it as sections progress
- Smooth interpolation/easing on rotation — no jittery or linear snapping

SCROLL SECTIONS
- Section 1: Hero as described above
- Section 2: Model rotates further, text callouts fade in pointing to specific design details (headlights, wheels, body lines)
- Section 3: Performance stats section, numbers count up on scroll into view
- Section 4: Color/trim selector — clicking a swatch changes the model's material color in real time
- Footer: minimal, logo + links

TECHNICAL REQUIREMENTS
- Use GSAP ScrollTrigger for all scroll-linked animation (build on top of what's in /reference, don't reinvent it)
- Three.js / React Three Fiber for the 3D model
- Fully responsive — on mobile, replace scroll-linked rotation with a simple auto-rotate or swipe-to-rotate, since scroll-jacking on mobile is a bad UX pattern
- Optimize model loading — show a loading state/progress bar while the .glb loads, don't leave a blank frozen screen

DESIGN CONSTRAINTS — AVOID GENERIC "AI SLOP" AESTHETICS
- Do NOT use purple-to-blue gradients, glassmorphism cards, or generic "SaaS landing page" styling — this is a car brand site, not a startup pitch page
- Do NOT use default system fonts (Arial, generic sans-serif) — pick one intentional, bold, condensed or geometric display typeface for headlines and a clean readable body font, and use them consistently
- Do NOT center everything symmetrically with equal padding everywhere — use asymmetric layouts like the reference image (off-center text, side-mounted UI elements)
- Do NOT use generic stock CTA copy like "Get Started," "Learn More," "Unlock the Future" — write specific, confident, brand-appropriate copy
- Do NOT add unnecessary decorative elements (floating blobs, random particles, generic icon grids) that don't serve the car showcase
- Do NOT use rounded-corner-everything or heavy drop shadows — keep edges sharp/minimal to match the automotive-premium feel in the reference
- Every animation should have a clear purpose tied to storytelling the car's design, not just "things fade in because scroll happened"
- Match the confident, editorial, high-end automotive brand feel — think restraint and precision, not maximalist decoration