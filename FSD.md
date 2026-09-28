# 📄 FSD: FUNCTIONAL SPECIFICATION DOCUMENT
## EXTREME EXOPLANETS - DAILY DROP & CRYPTOGRAPHIC AUTHENTICITY

> 🌐 **Official Live Platform:** **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**

---

### 1. Objective and Scope
This document details functional specifications, business rules, visual styling, and system architecture for the **Extreme Exoplanets** application (publicly hosted at **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**), emphasizing the interactive 3D physics viewport, the clean full-bleed A4 comic poster engine, and the **Invisible Cryptographic Watermark Protocol in Binary PNG Metadata (NFT-like Provenance)** to ensure authenticity of daily drops without compromising artistic fidelity.

---

### 2. 3D Viewport Specification (Retro CRT Monitor)

#### 2.1. Identified Challenge
While the original scanline visual effect succeeded aesthetically, the planet sphere lacked distinct rotational landmarks and dynamic directional lighting, making drag-rotation difficult to perceive when spinning the sphere with mouse or touch gestures.

#### 2.2. Implemented Engineering Solution
1. **Tangible 3D Rotational Perception:**
   - Introduced dynamic spherical surface relief (equatorial wind bands, atmospheric shear boundaries, and cyclonic storm vortices like the "Great Silicate Vortex") projected using 3D sinusoidal curvature ($X' = R \cdot \sin(\theta)$).
   - As the celestial body rotates, features emerge from the nightside limb, cross the lit dayside hemisphere, and vanish over the opposing terminator, establishing instant visual depth and spherical rotation.
2. **Dynamic Drag Sensitivity and Inertia:**
   - 1:1 responsive drag sensitivity multiplier.
   - Applied physical angular inertia (damped angular momentum), enabling users to flick the planet and watch it spin down smoothly according to physical friction laws.
   - Native touch and mouse interaction with dynamic `grab`/`grabbing` cursor states.

---

### 3. Vintage Comic A4 Poster Specification (Clean Visual Redefinition)

#### 3.1. Eliminated Elements (100% Unobstructed Art)
- ❌ **Upper Red Banner:** The generic "GALAXY OF HORRORS" header and "NASA EXTRATERRESTRIAL THREAT DOSSIER" text were **completely eliminated**.
- ❌ **Lower Black Bar:** The black footer bar with retail barcodes, legal fine print, and text strips was **completely eliminated**.
- ❌ **Specification Overlay Card:** The data card showing threat score, surface gravity, and temperature was **removed from the poster canvas**.
- ❌ **25¢ Cover Price:** The retail price was excised from the issue badge.
- ❌ **Bottom Text Overlays:** Planet name boxes, subtitle strips, and cryptographic hash strings were **completely removed from the illustration**, leaving the poster purely cinematic, pristine, and unblemished.

#### 3.2. Retained Visual Components
- ✅ **"Approved by Cosmic Archive Authority" Insignia:** Preserved with vintage comic framing in the upper-right corner.
- ✅ **"ISSUE #01 - EXTREME WORLDS DAILY" Badge:** Maintained in the upper-left corner with iconic yellow and red comic styling.
- ✅ **Bespoke Planetary Title:** Each world features a dramatic, organic comic title integrated into the artwork (e.g., *"THE RAZOR RAIN HORROR"*, *"THE IRON DELUGE"*, *"THE DEVOURING OVAL"*).
- ✅ **Prominent Central Illustration:** The exoplanet dominates the canvas with dramatic Jack Kirby cosmic energy krackle, Ben-Day halftone dot patterns, and vintage vignette aging.

---

### 4. Numbered Collector Mintage Protocol & Cryptographic Certification

#### 4.1. Concept: Democratic Mintage with Individualized Ownership
Rather than enforcing artificial scarcity (where only a single user downloads while others are locked out) or degrading public artwork with destructive watermarks, the system mirrors the classical fine-art model of **Numbered Collector Digital Lithographs / Engravings**:
1. **Universal Access & Uncompromised Quality:** Every visitor can download the master poster at 300 DPI (unwatermarked, paywall-free).
2. **Official Numbered Edition:** Each download atomically and sequentially increments the mintage counter for that day (`#0001`, `#0002`, `#0042`...).
3. **Registered Ownership:** Visitors can input their name or collector codename (e.g., *"Lucas Gomes"* or *"Commander Silva"*), permanently recording their provenance in the metadata.
4. **HMAC-SHA256 Digital Signature:** The backend signs the tuple `(Exoplanet + Date + Serial Number + Collector Name + Entropy)` using its master secret key.

#### 4.2. Technical Specification: Binary PNG `tEXt` Chunk Injection
The rendering pipeline intercepts the PNG byte stream and, directly before the terminating `IEND` chunk, injects official binary `tEXt` chunks accompanied by CRC-32 integrity validation:

| Chunk Key (`Keyword`) | Value Injected into PNG Binary Stream |
| :--- | :--- |
| `Exoplanet_ID` | Unique astronomical catalog identifier (e.g., `hd-189733b`) |
| `Exoplanet_Name` | Official astronomical designation (e.g., `HD 189733b`) |
| `Title` | Comic-style thematic cover title (e.g., `THE RAZOR RAIN HORROR`) |
| `Subtitle` | Thematic environmental subtitle (e.g., `Where Glass Rains Sideways`) |
| `Drop_Date` | Official daily drop date (`YYYY-MM-DD`) |
| `Mint_Number` | Sequential edition number (e.g., `EDITION #0001`) |
| `Collector_Name` | Registered collector name or codename |
| `NFT_Token_ID` | Unique identification token (`TOKEN#EXO-YYYYMMDD-0001-XXXX`) |
| `HMAC_Signature` | Cryptographic signature computed on server (`SHA256:...`) |
| `Serial_Entropy` | Random 8-character entropy string for collision resistance |
| `Authenticity` | `Certified Original Daily Drop - Extreme Exoplanets` |
| `Verification_Endpoint` | `/api/verify-token` |
| `Developer` | `Lucas Gomes (github.com/luckhaosbb)` |
| `Timestamp` | Exact ISO 8601 issuance timestamp |

#### 4.3. Pristine, Inviolable Visual Artwork
Unlike traditional models that burn visible watermarks or ugly serial barcodes over the image, the engine preserves the artwork 100% clean and cinematic. Zero coordinates, hashes, or serial numbers clutter the canvas. All mathematical proof of provenance and ownership resides exclusively within official binary chunks.

#### 4.4. Ownership Audit & Authenticity Verification
Anyone in possession of the file or its Token ID can audit its authenticity:
- **Via Web Interface (Poster Page):**
  - **Instant Drag-and-Drop:** Users drop the PNG file onto the poster verification zone. The browser parses binary `tEXt` chunks locally using `ArrayBuffer` in <10ms (without uploading heavy images to the server) and transmits strictly the cryptographic payload to `POST /api/verify-token`.
  - **Token ID Lookup:** Allows searching any issued edition directly via its alphanumeric code.
  - **Holographic Audit Dossier:** Displays verification outcome (`VALID OFFICIAL CERTIFICATE` or `TAMPERED`), registered owner, issue number, drop date, and HMAC-SHA256 signature validity.
- **Via Command Line Interface (CLI):** `npm run verify-poster <path-to-file.png>`
- **Via Direct HTTP Endpoint:** `POST https://exoplanets.luckhaosbb.dev/api/verify-token` (or locally `/api/verify-token`).
- If an attacker attempts to alter the owner's name inside the metadata or re-encode the pixels, the HMAC-SHA256 signature breaks immediately and the validator flags `❌ INVALID OR TAMPERED CERTIFICATE`.

#### 4.5. Infrastructure Resilience & Atomic Concurrency
- 300 DPI client-side Canvas rendering incurs 0% server CPU overhead.
- Database storage requires less than 120 bytes per issued edition.
- Sequential serial allocation is strictly atomic with locking per planet and date, eliminating race conditions.
- Rate limits of 5 mints per IP per hour prevent automated scrapers from exhausting numbers. Re-downloading the same planet on the same day returns the identical existing certificate (`reissued: true`).

---

### 5. Automation Architecture: Weekly Cycle & Generation Pipeline

#### 5.1. Structured Weekly Cosmic Cycle (Monday to Sunday)
1. **Closed Weekly Batches:** Publications are organized into contiguous 7-day blocks (Monday 00:00:00 to Sunday 23:59:59 BRT).
2. **Saturday Midnight Cron (00:00:00):**
   - With Sunday running the final drop of the current week, the background scheduler (`cronService`) locks and pre-generates the **full upcoming week** in the database.
   - When Monday at 00:00:00 arrives, the new cycle debuts instantaneously with zero runtime delay.

#### 5.2. AI Resilience Cascade (Cascade Fallback Chain - High Availability)
1. **Multi-Tier Zero-Downtime Redundancy:**
   - **Route 1 (Primary):** Together AI (`black-forest-labs/FLUX.1.1-pro`), synthesizing high-resolution 768x1024 vertical and 1024x768 horizontal art via high-speed GPU clusters.
   - **Route 2 (Fallback):** Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`), 10,000 free Neurons/day across Cloudflare's global edge network.
   - **Manual Curation Route / Gold Standard:** Google Cloud Imagen 3 (`imagen-3.0-generate-002`) / Gemini Pro Web, reference standard for master issues.
2. **Sequential Queue & Circuit Breakers:**
   - Batches are processed sequentially with safety pauses. If an upstream provider returns rate limits (`429`), payment errors (`402`), or timeouts, the engine automatically falls back to the secondary tier without crashing the weekend pipeline.
3. **Comprehensive Pipeline Specification:** Detailed in [`ARCHITECTURE_AI_PIPELINE.md`](ARCHITECTURE_AI_PIPELINE.md).

#### 5.3. Incremental Database Growth
- The database expands in steady increments of **7 exoplanets per week**.
- Pre-seeding hundreds of planets is unnecessary: each Saturday, the next 7 worlds are cataloged and cryptographically signed.

---

### 6. Official Prompt Engineering Guidelines (100% Full-Bleed Standard)

#### 6.1. Root Cause of Unwanted Border Margins
When modern diffusion models encounter phrases like `"comic book cover"`, they infer an instruction to render the scanned physical paper of an aged magazine, introducing:
- Wide off-white, yellowed paper margins surrounding the art;
- External black panel framing lines;
- Shrinkage of the usable illustration area.

#### 6.2. Implemented Technical Solution
1. Replaced `"comic book cover"` with `"Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic"`.
2. Explicitly enforced edge-to-edge bleed: `"The illustration completely fills 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting"`.
3. Added strict negative constraints: `"Completely borderless, full bleed, seamless canvas edges, no borders, no margins, no outer frame, no framing box, no panel borders around the canvas, no paper border trim, no white borders"`.

#### 6.3. Universal Master Template for New Exoplanets
- **Portrait (Standard):** Aspect Ratio `2:3`
- **Landscape:** Aspect Ratio `3:2`

```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, [PLANET_ATMOSPHERIC_ELEMENTS], and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "[THEMATIC_TITLE_IN_ENGLISH]". The typography features [LETTERING_STYLE: e.g. blazing molten gold / brutal molten iron / jagged shattered silicate glass] letterforms with deep 3D block drop shadow and vibrant retro pulp gradient. Below the title, the exoplanet [PLANET_NAME] dominates the composition [PLANET_DESCRIPTION_AND_EXTREME_HAZARD]. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

#### 6.4. Collection Master Prompts (Issues #001 through #008)

* **Issue #001: HD 189733b – "THE RAZOR RAIN HORROR" (Landscape 3:2):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, cobalt-blue storm clouds, planetary atmospheric vortex, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE RAZOR RAIN HORROR". The typography features jagged, razor-sharp shattered silicate glass letterforms with dynamic explosive perspective, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from bright cadmium yellow at the top to fiery vermilion red at the bottom. Below the title, the deep cobalt-blue exoplanet HD 189733b dominates the composition, caught in a cataclysmic tempest, with monstrous horizontal supersonic winds at Mach 7 whipping thousands of glowing, razor-sharp shards of molten liquid glass horizontally across the planetary surface and bleeding off the edges of the canvas. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #002: KELT-9b – "THE STELLAR FURNACE" (Portrait 2:3):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, nebulae, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE STELLAR FURNACE". The typography features blazing molten gold and blinding solar fire letterforms with deep 3D block drop shadow and retro pulp gradient from bright solar yellow to incandescent orange-red. Below the title, the ultra-hot exoplanet KELT-9b dominates the composition, glowing violently with blazing solar furnace heat at 4300 degrees Celsius, orbiting dangerously close to a blinding blue-white star, with a monstrous comet tail of vaporized iron and titanium plasma streaming into deep space. Dynamic Jack Kirby cosmic energy krackle dots, swirling planetary atmospheric bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #003: WASP-76b – "THE IRON DELUGE" (Portrait 2:3):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, stormy metallic atmospheric clouds, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE IRON DELUGE". The typography features heavy, brutal molten iron letterforms with jagged glowing dripping edges, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from bright molten yellow to fiery iron-red. Below the title, the tidally locked exoplanet WASP-76b dominates the composition with a dramatic terminator line: the blistering copper dayside contrasts against the dark nightside where an apocalyptic, torrential deluge of incandescent liquid molten iron raindrops falls through dark metallic storm clouds and surreal alien landscape below. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #004: TrES-2b – "THE LIGHTLESS VOID" (Portrait 2:3):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, eerie deep space nebula, shadowy cosmic dust, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE LIGHTLESS VOID". The typography features abyssal obsidian and smoking charcoal letterforms with faint crimson glowing ember cracks and edges, heavy black India ink outlines, deep 3D block drop shadow, and a sinister retro pulp gradient from dark fiery blood-red to pitch void black. Below the title, the pitch-black exoplanet TrES-2b dominates the composition, darker than coal and absorbing 99% of all light, a monstrous light-devouring sphere looming menacingly against the stars, faintly glowing with eerie deep infrared thermal red embers radiating from its mysterious ultra-hot atmosphere of vaporized sodium and titanium oxide. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #005: WASP-12b – "THE DEVOURING OVAL" (Landscape 3:2):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, blazing solar corona filaments, superheated carbon gas ribbons, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE DEVOURING OVAL". The typography features tidal-stretched blazing solar plasma and molten amber letterforms with explosive solar flare accents, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from intense incandescent yellow at the top to fiery magma orange at the bottom. Below the title, the doomed exoplanet WASP-12b dominates the composition, violently distorted and stretched into an egg-like oval by titanic tidal gravitational forces, as a colossal nearby yellow dwarf star voraciously siphons and devours its glowing superheated atmosphere in massive swirling bridges of incandescent gas and plasma streaming across the cosmos and bleeding off the edges of the canvas. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #006: 55 Cancri e – "THE DIAMOND CRUCIBLE" (Portrait 2:3):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, shimmering crystalline dust, toxic cyan vapor plumes, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE DIAMOND CRUCIBLE". The typography features scintillating crystalline diamond and burning molten lava letterforms with razor-sharp gem-cut facets and dripping liquid magma edges, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from electric crystalline cyan-blue to fiery molten lava-red. Below the title, the super-Earth exoplanet 55 Cancri e dominates the composition, a hellish world of global boiling liquid magma oceans and fiery volcanic geysers spewing toxic cyan cyanide clouds, with titanic crust fissures revealing glowing compressed sparkling pure diamond crystals under extreme planetary pressure, bathed in the fierce glare of its nearby star. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #007: PSR B1257+12c – "THE PULSAR OF THE DEAD" (Portrait 2:3):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, ghostly glowing magnetic nebula filaments, lethal gamma radiation arcs, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE PULSAR OF THE DEAD". The typography features crackling radioactive neon-violet and electric cyan lightning letterforms with jagged ethereal ghost-like edges, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from brilliant electric cyan at the top to deep radioactive violet-purple at the bottom. Below the title, the eerie rocky exoplanet PSR B1257+12c dominates the composition, a ghost world condemned to orbit a rapidly spinning dead neutron star pulsar, swept by lethal relativistic lighthouse beams of gamma-ray radiation, intense magnetic shockwaves, and spectral neon auroras washing over its cratered desolate surface. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #008: GJ 1214b – "THE BOUNDLESS BOILING SEA" (Landscape 3:2):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, dense sapphire steam clouds, glowing atmospheric vapor veils, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE BOUNDLESS BOILING SEA". The typography features surging ocean water and high-pressure boiling steam letterforms with churning wave crests and swirling vapor tendrils, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from luminous aquamarine-cyan at the top to deep oceanic abyssal blue at the bottom. Below the title, the mysterious water-world exoplanet GJ 1214b dominates the composition, a shoreless and bottomless oceanic super-Earth blanketed in thick sweltering steam mists and massive cyclonic clouds, where boiling supercritical water at 20000 atmospheres of crushing pressure churns under the eerie reddish glow of a dim red dwarf star and bleeds off all canvas edges. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

---

### 7. Weekly Curator Deck (Confidential Author Panel)

#### 7.1. Purpose
Provides the author/curator with confidential tools to inspect and audit upcoming weekly planetary batches scheduled on Saturday, view dynamic renders directly inside the A4 poster engine in real time, and trigger manual regenerations on demand.

#### 7.2. Core Capabilities
1. **Visual Audit Grid:** 7-day schedule (Monday to Sunday) tracking artwork readiness status (`● Ready` or `○ Pending`).
2. **On-Demand Regeneration (`POST /api/curadoria/regenerate`):** Triggers immediate artwork re-generation for an individual planet.
3. **Manual Cycle Trigger (`POST /api/curadoria/run-weekly-cycle`):** Advances or re-runs the entire upcoming weekly schedule on demand via the *"⚡ Execute Next Week Cycle"* interface button.

#### 7.3. Cybersecurity Architecture & Hardening
- **HMAC-SHA256 Token Gate:** Curation endpoints require signed tokens validated with `SERVER_SECRET_KEY` via `requireCuratorAuth`.
- **Path Traversal Defense (CWE-22):** Strict regex validation (`/^[a-zA-Z0-9_-]{2,64}$/`) on any `planetId` parameter before reading or persisting image buffers.
- **Information Disclosure Protection (CWE-200):** Sensitive credentials are never exposed in JSON responses or error messages.
