# 🪐 PRODUCT VISION DOCUMENT: EXTREME EXOPLANETS (DEADLY WORLDS)

> 🌐 **Official Live Platform:** **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**  
> **"In space, no one can hear you burn, get shredded by supersonic glass, or evaporate in iron rain."**  
> *Inspired by NASA's "Galaxy of Horrors" project.*

---

## 1. Product Overview

**Extreme Exoplanets** (publicly available at **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**) is an interactive, atmospheric, and geek-centric web application presenting **one deadly exoplanet every 24 hours**.

Each day, an unprecedented hostile alien world is selected by the automated engine. The experience immerses visitors in verified scientific data and horrifying environmental conditions through an interface inspired by retro sci-fi space probe CRT terminals.

At the journey's climax, users gain exclusive access to a downloadable **Vintage Comic-Style Collectible Poster** in **A4 proportion**, dynamically synthesized with that exoplanet's lethal characteristics and embedded with a **Cryptographic Authenticity Token (NFT-like Provenance)**, available for minting strictly during that 24-hour cycle.

---

## 2. User Personas & Target Audience

- **Sci-Fi, Space Exploration & Astronomy Enthusiasts:** Devotees of astrophysics, vintage graphic novels (Marvel, EC Comics, 1960s–1980s), and cosmic horror aesthetics.
- **STEM Students & Lifelong Learners:** Curious minds captivated by hard science presented with engaging, cinematic narrative depth.
- **Digital Art Collectors:** Users driven by the "Daily Drop" concept, returning every 24 hours to secure their authenticated lithograph before midnight when the orbital window closes.

---

## 3. Business Rules, Automation & Weekly Cycles

### 3.1. Structured Weekly Cosmic Cycle (Monday to Sunday)
- The platform operates in **Closed Cosmic Weeks (Monday 00:00:00 to Sunday 23:59:59 BRT)**.
- **Saturday Midnight Trigger (00:00:00):** Every Saturday at midnight, the background scheduler (`cronService`) locks and schedules the **entire upcoming week (Monday through Sunday)** in the database.
- Sunday executes the final drop of the active week uninterrupted; on Monday at 00:00:00, the new planetary cycle goes live immediately with pre-rendered assets.

### 3.2. AI Generation Cascade (Cascade Fallback Chain - High Availability)
- The Node.js backend implements a **Multi-Provider Redundancy Cascade** to guarantee zero downtime during scheduled generation:
  - **Route 1 (Primary):** Together AI (`black-forest-labs/FLUX.1.1-pro`), delivering native 768x1024 vertical and 1024x768 horizontal splash art in seconds.
  - **Route 2 (Fallback):** Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`), free global edge generation with 10,000 daily Neurons.
  - **Curation Standard:** Google Gemini Pro Web / Google Cloud Imagen 3 (`imagen-3.0-generate-002`), benchmark master standard used for Issues #001 through #005.
- **Anti-429 & Retry Strategy:** Sequential pipeline execution with security delays between worlds and exponential backoff retry policies. Detailed in [`ARCHITECTURE_AI_PIPELINE.md`](ARCHITECTURE_AI_PIPELINE.md).
- Generated master files are persisted to `server/assets/planets/` and `public/assets/planets/` in **100% Full-Bleed** borderless resolution.

### 3.3. Incremental Database Architecture
- The database expands sustainably in recurring batches of **7 exoplanets per week**.
- Every Saturday, the system pulls the next 7 worlds from the catalog and NASA TAP API, attaching technical dossiers, thematic titles, and cryptographic keys without requiring a full year's pre-population at launch.

### 3.4. Exclusivity & Ephemerality
- Public visitors have access **strictly to the exoplanet and poster of the current day**.
- A real-time countdown timer ("Next Orbital Jump in: HH:MM:SS") reminds visitors of the remaining window to explore and mint the day's poster before the midnight shift.
- There is no public back-catalog download archive, reinforcing rarity and anticipation.

---

## 4. Visual Experience & Technical Specifications

### 4.1. Visual Aesthetic: "Sci-Fi CRT Terminal"
- **Color Theme:** Dark void space palette with deep cosmic gradients and a retrofuturistic scientific observatory atmosphere.
- **CRT Shader FX:** Subtle scanlines, gentle chromatic aberration, space-probe monitor framing, monospace technical typography, and bold punchy headings.
- **Immersive Audio:** Optional analog synthesized sound effects (relay clicks, sensory telemetry beeps, biohazard alarms) via Web Audio API.

### 4.2. 3D Viewport with True Spherical Physics & Rotational Inertia
- Real-time 3D spherical rendering with immediate drag response and tangible physical inertia.
- **Spherical Relief & Surface Landmarks:**
  - Atmospheric vortices, wind shear bands, and storm lanes rendered with 3D sinusoidal projection ($X' = R \cdot \sin(\theta)$) that wrap realistically around the sphere during rotation.
  - *HD 189733b:* Cobalt atmosphere with the Great Silicate Vortex and horizontal Mach 7 liquid glass squalls.
  - *WASP-76b:* Scorching copper dayside with molten incandescent iron rain deluges.
  - *KELT-9b:* Stellar plasma atmosphere with solar flares and lethal UV radiance.
  - *TrES-2b:* Darker than coal, radiating sinister deep-infrared thermal glows from internal volcanic heat.
  - *55 Cancri e:* Carbon-rich magma oceans under planetary pressure precipitating diamond showers.
  - *WASP-12b:* Egg-shaped tidal distortion being steadily cannibalized by its parent star.
  - *PSR B1257+12c (Poltergeist):* Barren dead world swept by pulsar gamma radiation beams.
- **Full Responsiveness:** Dynamically calibrated across mobile screens, tablets, and ultrawide desktop monitors via `ResizeObserver`.

### 4.3. Scientific Telemetry & Human Survival Simulator
- Complete planetary metrics (Temperature in °C/°F, Distance in light-years, Surface Gravity, Atmospheric Composition, Host Star).
- **Human Survival Time Calculator:** Fatal countdown detailing the milliseconds/seconds an astronaut could endure on the surface and the biological cause of destruction.
- **NASA Validation Seal:** Live data synchronicity with NASA's TAP Exoplanet Archive API.

---

## 5. Vintage Comic A4 Poster Generator (Authorial Fine Art Redefinition)

### 5.1. Poster Concept
Museum-grade, authorial fine art celebrating 1970s Jack Kirby cosmic graphic novels in **100% Full-Bleed borderless format (zero white margins, zero external comic frames)**, allowing cosmic illustrations to extend to the canvas edge while official seals float directly over the cosmos.

### 5.2. Visual Elements of the Banner
1. **100% Full-Bleed Composition (Zero Borders, Zero Clutter):**
   - **No paper margins or framing boxes:** Illustration extends to the edge on all 4 sides, filling the A4 canvas in both portrait (`2480 × 3508px`) and landscape (`3508 × 2480px`) orientations.
   - **No cluttering spec boxes or secondary text:** Secondary scientific telemetry is hosted on the web page, preserving the poster for pure cinematic graphic art.
2. **Cosmic Authority Approval Seal:**
   - Vintage approval insignia in the upper-right corner: *"APPROVED BY THE COSMIC ARCHIVE AUTHORITY ★ NASA ★"*.
3. **Retro Issue Identification Badge:**
   - Stylized yellow-and-red comic badge in the upper-left corner: *"ISSUE #001"*.
4. **Planetary Name Plaque:**
   - Lower-left vintage yellow plaque displaying the official astronomical designation (e.g., *"WASP-76b"*, *"HD 189733b"*).
5. **Thematic Title Typography:**
   - Integrated bespoke cover title (e.g., *"THE RAZOR RAIN HORROR"*, *"THE IRON DELUGE"*), featuring 3D extruded lettering and bold India ink contours.
6. **Numbered Collector Mintage Protocol:**
   - **Democratic Access & Individualized Ownership:** Every visitor can download the master poster at 300 DPI (unwatermarked, paywall-free). Each download atomically issues the next sequential edition number (`#0001`, `#0002`, `#0042`...).
   - **Cryptographic Registration:** Collectors can input their name or codename, which is digitally signed on the backend using **HMAC-SHA256**.
   - **Binary Chunk Injection:** Token ID, digital signature, edition serial, and drop date are injected into binary PNG `tEXt` chunks before the `IEND` marker, keeping visual art 100% pure.
   - **Authenticity Audit (Web & CLI):** Instant verification on the web page (via client-side drag-and-drop ArrayBuffer parsing) and CLI (`npm run verify-poster <file.png>`), detecting any file alteration.
7. **High-Resolution Master Output (A4 300 DPI):**
   - Exact physical printing resolution: Portrait `2480 × 3508px` or Landscape `3508 × 2480px`.

---

## 6. Curatorship & Author Attribution

- **Confidential Curator Deck:** Author console to inspect and audit upcoming exoplanet batches, preview live A4 posters, and trigger on-demand regenerations.
- **Author Attribution & Official Links:**
  - **Official Application Website:** [https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)
  - Developer Profile on **GitHub:** [@luckhaosbb](https://github.com/luckhaosbb)
  - Professional Profile on **LinkedIn:** [Lucas Gomes](https://www.linkedin.com/in/lucas-gomes-ab49582bb)
  - Personal Portfolio: [https://luckhaosbb.dev](https://luckhaosbb.dev)
  - Academic citations and NASA Exoplanet Archive credits.

---

## 7. System Architecture & Directory Tree (SOLID Clean Architecture)

```
Daily Exoplanets/
├── ARCHITECTURE_AI_PIPELINE.md      # AI pipeline & Cascade Fallback Chain documentation
├── PRODUCT_VISION.md                # Product vision and design specifications
├── FSD.md                           # Functional Specification Document (FSD)
├── README.md                        # Technical documentation & onboarding guide
├── scripts/
│   ├── testEmail.js                 # Resend API transactional test utility
│   └── verifyPoster.js              # Standalone CLI binary PNG chunk verifier
├── server/                          # Node.js / Express Backend (Layered Clean Architecture)
│   ├── assets/planets/              # Confidential official full-bleed master artworks
│   ├── config/index.js              # Typed centralized configuration (PORT, Keys, Schedulers)
│   ├── controllers/                 # Presentation Layer (HTTP API Controllers)
│   │   ├── authController.js
│   │   ├── cryptoController.js
│   │   ├── planetController.js      # Planetary endpoints, rotation and curation
│   │   └── subscriberController.js
│   ├── data/
│   │   ├── exoplanets.js            # Astronomical catalog & metadata
│   │   ├── prompts.js               # Validated 100% Full-Bleed prompt templates
│   │   ├── published_planets.json   # Local fallback persistence
│   │   ├── poster_mints.json        # Sequential collector mintage ledger
│   │   └── subscribers.json
│   ├── services/                    # Business Logic Layer
│   │   ├── aiImageService.js        # Multi-tier cascade generation engine
│   │   ├── authService.js           # HMAC-SHA256 session token management
│   │   ├── cronService.js           # Saturday midnight batch scheduler
│   │   ├── cryptoService.js         # HMAC-SHA256 certificate generation & verification
│   │   ├── emailService.js          # Resend transactional emails
│   │   ├── nasaService.js           # NASA TAP API live synchronization
│   │   ├── planetService.js         # Daily drop life-cycle orchestration
│   │   └── subscriberService.js     # RFC subscriber sanitization & management
│   ├── repositories/                # Data Access Layer (Hybrid Postgres / JSON)
│   │   ├── database.js
│   │   ├── mintRepository.js
│   │   ├── planetRepository.js
│   │   └── subscriberRepository.js
│   ├── middlewares/authMiddleware.js# Security token guards
│   ├── routes/api.js                # Decoupled Express router
│   └── server.js                    # Express bootstrap, security headers & SPA static hosting
├── src/
│   ├── components/
│   │   ├── comicBannerGenerator.js  # Procedural A4 Full-Bleed engine with binary chunk injection
│   │   ├── curadoriaModule.js       # Curatorship viewport & preview interface
│   │   ├── planetRenderer.js        # Responsive 3D spherical physics renderer
│   │   ├── nasaApi.js               # Client-side NASA API bridge
│   │   ├── soundEffects.js          # Web Audio API synthesized sound generator
│   │   └── telemetrySnapshotGenerator.js # Telemetry snapshot export engine
│   ├── data/exoplanets.js           # Offline emergency static fallback
│   ├── style.css                    # Retro CRT sci-fi styling & responsive rules
│   └── main.js                      # SPA orchestrator, navigation & UI events
├── index.html                       # Entry point & semantic layout
├── package.json                     # Scripts and dependencies
└── vite.config.js                   # Vite bundling and development proxy
```
