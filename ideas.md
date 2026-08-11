# Truck pe Music — Design Direction

## Reference Ground Truth

The supplied reference images define the target experience: a full-bleed cinematic highway scene, dark glass HUD pills in the upper corners, a prominent centered vehicle or illustration, and a low-floating music player dock with album art, track metadata, progress, and transport controls. The second reference adds the cultural cue of bold Indian folk illustration and Devanagari display lettering. The referenced YouTube playlist is an Indian bus-driver-themed collection of romantic 90s Bollywood tracks, with visible context including “Mujhse Mohabbat Ka,” “Tumsa Koi Pyaara,” “Pehli Pehli Baar Mohabbat Ki Hai,” and similar Kumar Sanu / Alka Yagnik material.

This site should feel inspired by that composition, not reproduce any particular screenshot or third-party mark. Playback uses a lawful demo mode with no bundled commercial MP3s; the interface is ready for a user-provided licensed source later.

## Chosen Approach: Cinematic Indian Truck-Art Road Trip

### Design Movement
Contemporary editorial motion design fused with Indian truck-art folk illustration and late-90s music-player nostalgia.

### Core Principles
1. **The road is the interface.** The scene provides orientation, pace, and emotional context; controls float over it rather than interrupting it.
2. **Hand-painted warmth meets software precision.** Folk motifs, paper grain, and painted colors sit beside restrained glass HUD surfaces and crisp transport controls.
3. **Motion is ambient, not noisy.** Sky drift, road lines, particles, and truck suspension animate continuously, while interactive states remain short and tactile.
4. **Nostalgia without clutter.** The playlist is rich and recognizable, but the primary screen stays focused on the current song and the next action.

### Color Philosophy
Indigo is the night-road anchor and protects readability. Saffron and terracotta carry the glow of sunset and the warmth of roadside culture. Cream is reserved for type and markers so the interface reads like painted enamel against a dark dashboard. The ownable brand color is **Truck Saffron #F3A62A**: optimistic, unmistakably road-lit, and used sparingly for progress, active states, and tiny folk accents.

### Layout Paradigm
A full-viewport stage with diagonal depth: the horizon sits behind a low-center truck silhouette, the upper HUD is split asymmetrically, and the player dock floats above the lower edge with a rightward bias on desktop. The queue expands as a bottom-sheet rather than navigating away, preserving the sense of staying inside the same moving scene.

### Signature Elements
- A tiny live-dot highway counter and real-time clock in dark translucent capsules.
- A segmented “road” seek bar whose marker is a tiny truck instead of a generic knob.
- Folk border details, marigold dots, and a vinyl-like circular album badge that rotate only when playback is active.

### Interaction Philosophy
Every action should feel like a physical dashboard response: buttons depress on tap, the horn flashes the scene, play/pause ripples outward, and selecting a track crossfades the art and caption. Secondary utilities (queue, about, volume) open in place with clear escape routes and keyboard access.

### Animation
Decorative motion runs behind the UI: a 70-second color drift, multi-speed birds, gentle tree sway, road dashes streaming toward the viewer, slow particles, and a 4px suspension bob on the truck. Interactive motion is shorter: 160–240ms for controls, 320ms for the queue sheet, and 500ms for track art crossfades. Respect `prefers-reduced-motion` by freezing nonessential ambient loops while leaving playback controls functional.

### Typography System
Use **Bebas Neue** for compact western signage and counters, **Tiro Devanagari Hindi** for the Hindi caption, and **DM Sans** for metadata and controls. Headlines are uppercase, tracked, and short; Hindi captions are larger and softer; metadata stays compact with generous contrast.

### Brand Essence
A nostalgic highway listening room for people who want 90s Hindi romance to travel with them, distinguished by an animated truck-art road scene rather than a static playlist page. Personality: **warm, cinematic, unhurried**.

### Brand Voice
Headlines sound like painted signboards and roadside radio chatter. CTAs are concise and human; microcopy is never corporate filler.

Example lines:
- “Let the road choose the next song.”
- “Chai break — pause here, the highway keeps humming.”

### Wordmark & Logo
Use a compact emblem rather than a default text wordmark: a front-facing truck grille merged with a vinyl record center and two highway lines beneath. The text lockup pairs a condensed uppercase “TRUCK PE” with a smaller Devanagari-friendly “MUSIC” treatment, but the emblem must carry recognition at small sizes.

### Signature Brand Color
**Truck Saffron — `#F3A62A`**.

## Build Notes

The first screen will ship as a single responsive React page with modular scene layers, a working demo playback state, a track queue bottom sheet, a live clock, a ticking listener count, reduced-motion support, and direct affordances for swapping in a licensed audio source later. Generated imagery is used only for the hero and playlist art; the rest of the scene is built with CSS and inline SVG-style silhouettes for crisp responsiveness.
