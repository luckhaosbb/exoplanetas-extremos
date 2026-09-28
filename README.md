# 🪐 Extreme Exoplanets (Daily Extreme Exoplanet Archive)

<div align="center">

[![Website](https://img.shields.io/badge/🌐_VISIT_LIVE_WEBSITE-exoplanets.luckhaosbb.dev-00f0ff?style=for-the-badge&logo=googlechrome&logoColor=black)](https://exoplanets.luckhaosbb.dev/)
[![Status](https://img.shields.io/badge/STATUS-ONLINE%20%2F%20LIVE-success?style=for-the-badge)](https://exoplanets.luckhaosbb.dev/)
[![NASA TAP API](https://img.shields.io/badge/NASA%20TAP-LIVE%20SYNC-informational?style=for-the-badge&logo=nasa)](https://exoplanets.luckhaosbb.dev/)

### 🚀 **Visit the Live Observatory:**  
# 👉 **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)** 👈

*Explore daily extreme exoplanets, interactive 3D retro CRT orbital telemetry, and mint your authenticated A4 vintage comic poster before midnight.*

---

[![Live Website](https://img.shields.io/badge/Live_URL-https%3A%2F%2Fexoplanets.luckhaosbb.dev-00f0ff.svg?style=flat-square&logo=firefoxbrowser)](https://exoplanets.luckhaosbb.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-336791.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Architecture](https://img.shields.io/badge/Architecture-SOLID%20Clean%20Design-blueviolet.svg?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)]()

</div>

> **"In space, no one can hear you burn, get shredded by supersonic glass, or evaporate in iron rain."**  
> *An interactive experience featuring retro-futuristic sci-fi aesthetics, inspired by NASA's "Galaxy of Horrors" and the Golden Age of Comic Books.*

---

## 🌌 Overview

> 🌐 **Live Web Application:** **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**

**Extreme Exoplanets** is a full-stack web application designed with enterprise-grade software engineering standards and senior systems design principles. Deployed and fully operational at **[exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**, the platform delivers **one deadly exoplanet every 24 hours** in an automated *Daily Drop* schedule, guaranteeing a non-repeating astronomical rotation cycle until catalog exhaustion.

### Core Features:
1. **3D Telemetry CRT Sensor (Retro-futuristic Aesthetic):** Interactive spherical physics renderer with damped angular inertia, 3D dynamic lighting, scanlines, and custom atmospheric relief shaders unique to each world (Mach 7 silicate rain, stellar plasma, molten iron deluges, etc.).
2. **Vintage Comic Full-Bleed A4 Poster (300 DPI):** Procedural artwork generator delivering classic vintage comic splash art in **100% Full-Bleed borderless format** (no paper margins or framing boxes), automatically stamping issue sequencing (`ISSUE #001`, `ISSUE #002`), embossed bespoke typography, Ben-Day halftone grids, and cosmic approval stamps.
3. **Invisible Cryptographic Watermark (NFT-like Provenance):** W3C standard binary chunk injection (`tEXt` chunks with CRC-32 integrity validation) directly into the generated PNG file stream. Server-side digital signatures utilize **HMAC-SHA256**, ensuring immutable and verifiable authenticity via the `/api/verify-token` endpoint.
4. **Daily Tyler Vigen-Style Notifications:** Minimalist, distraction-free newsletter alert system for upcoming daily drops.
5. **Live Scientific Telemetry:** Asynchronous synchronization with NASA's TAP Exoplanet Archive API for real-time astronomical verification.
6. **Cascade Fallback Chain AI Pipeline:** Autonomous weekly batch generation running every Saturday at 00:00:00 with 4-tier zero-failure redundancy (SiliconFlow -> Cloudflare Workers AI -> Hugging Face -> Pollinations.ai). Detailed in [`ARCHITECTURE_AI_PIPELINE.md`](ARCHITECTURE_AI_PIPELINE.md).

---

## 🏛️ Software Architecture & SOLID Principles

The backend is built following **Layered Clean Architecture** and strictly adheres to the five **SOLID** principles:

```
Daily Exoplanets/
├── ARCHITECTURE_AI_PIPELINE.md  # Deep dive into AI cascade and weekly cron automation
├── DOCUMENTO_DE_VISAO.md        # Product vision, requirements & design specs
├── FSD.md                       # Functional Specification Document (FSD)
├── server/
│   ├── assets/planets/          # Confidential official full-bleed master artworks
│   ├── config/                  # Centralized typed environment configurations
│   ├── data/                    # Astronomical catalog, prompts and persistent storage
│   │   ├── exoplanets.js
│   │   ├── prompts.js           # 100% Full-Bleed 1970s retro pulp prompt templates
│   │   ├── published_planets.json
│   │   ├── poster_mints.json    # Numbered collector mintage logs
│   │   └── subscribers.json
│   ├── repositories/            # Data Access Layer (Persistence)
│   │   ├── database.js          # PostgreSQL Connection Pool with auto-migrating DDL
│   │   ├── mintRepository.js    # Numbered mintage and ownership persistence
│   │   ├── planetRepository.js  # Exoplanet queries and mutations abstraction
│   │   └── subscriberRepository.js # Subscriber queries and mutations abstraction
│   ├── services/                # Business Logic Layer
│   │   ├── aiImageService.js    # 5-tier Cascade Fallback Chain AI generation
│   │   ├── authService.js       # Curator HMAC-SHA256 token issuance & validation
│   │   ├── cronService.js       # Schedulers (Weekly Saturday midnight AI & Daily Drop Alerts)
│   │   ├── cryptoService.js     # HMAC-SHA256 signature generation and validation
│   │   ├── emailService.js      # Resend API transactional emails (Welcome & Daily Drops)
│   │   ├── planetService.js     # Daily drop rotation orchestration without repetition
│   │   └── subscriberService.js # RFC email validation and subscription sanitization
├── controllers/             # Presentation Layer (HTTP API Controllers)
│   ├── authController.js
│   ├── cryptoController.js
│   ├── planetController.js
│   └── subscriberController.js
├── middlewares/             # Security & authentication guards
│   └── authMiddleware.js
├── routes/                  # Decoupled Express routing
│   └── api.js
└── server.js                # Express bootstrap, security middlewares, and SPA static hosting
```

### How SOLID Principles are Implemented:
- **S - Single Responsibility Principle (SRP):** Each service and repository possesses a single, well-defined domain responsibility. `cryptoService` handles solely cryptographic integrity, while `planetService` orchestrates publication rules and daily rotations.
- **O - Open/Closed Principle (OCP):** The repository layer enables extending database providers (e.g., migrating to MongoDB or DynamoDB) without altering core business rules in the service layer.
- **L - Liskov Substitution Principle (LSP):** The unified repository contract behaves identically whether connecting to cloud PostgreSQL or falling back to local persistent JSON storage.
- **I - Interface Segregation Principle (ISP):** Repositories and controllers maintain lean, specialized contracts exposing strictly necessary domain methods.
- **D - Dependency Inversion Principle (DIP):** Controllers depend on service abstractions, and services depend on repository interfaces, completely decoupling business logic from direct database drivers or filesystem APIs.

---

## 🐘 Dual-Engine Data Persistence

The application employs a **hybrid resilience architecture**:
- **PostgreSQL (Cloud / Production):** Automatically initialized whenever `DATABASE_URL` is configured (e.g., Supabase, Neon, AWS RDS, or Render). Schema migrations for tables (`published_planets` and `subscribers`) execute idempotently on startup.
- **JSON Engine (Zero-Config Local Development):** If `DATABASE_URL` is omitted, the system seamlessly activates persistent JSON storage inside `server/data/`, eliminating the requirement of Docker containers for local testing or academic evaluations.

---

## 🔐 Numbered Collector Mintage & Cryptographic Certification Protocol

Unlike systems that restrict file access with watermarks or artificial paywalls, **Extreme Exoplanets** adopts the traditional fine-art model of **Numbered Collector Digital Lithographs / Engravings**:

- **Universal Access & Maximum Fidelity:** Any visitor can freely download original artworks at maximum resolution (A4 300 DPI, unwatermarked, zero paywalls).
- **Exclusive Official Edition:** Each download atomically and sequentially issues the next mintage number for that daily drop (`#0001`, `#0002`, `#0042`...).
- **Registered Ownership:** Visitors can register their name or collector codename (or opt for an official anonymous mintage).
- **HMAC-SHA256 Digital Signature:** The server mathematically signs the tuple `(Exoplanet + Date + Serial Number + Collector Name + Entropy)` using its master private key.
- **Invisible Binary Injection (tEXt Chunks):** The client-side rendering engine (`ComicBannerGenerator`) synthesizes the PNG and injects the invisible certificate before the `IEND` marker, with CRC-32 integrity validation.
- **100% Pure Visual Artwork:** The artwork remains completely pristine and cinematic, with zero hashes, code snippets, or distracting stamps cluttering the illustration. Provenance resides entirely within official binary metadata.

### Binary PNG Chunks Specification:

| `tEXt` Chunk Key | Data Description |
| :--- | :--- |
| `Exoplanet_ID` | Unique astronomical catalog identifier (e.g., `hd-189733b`) |
| `Exoplanet_Name` | Official astronomical designation (e.g., `HD 189733b`) |
| `Title` | Comic-style thematic cover title (e.g., `THE RAZOR RAIN HORROR`) |
| `Drop_Date` | Official daily drop date (`YYYY-MM-DD`) |
| `Mint_Number` | Sequential edition number issued (e.g., `EDITION #0001`) |
| `Collector_Name` | Registered name or codename of the collector/owner |
| `NFT_Token_ID` | Unique identification token (`TOKEN#EXO-YYYYMMDD-0001-XXXX`) |
| `HMAC_Signature` | Cryptographic signature computed on the server with private key (`SHA256:...`) |
| `Serial_Entropy` | Random 8-character entropy string for collision protection |
| `Authenticity` | Official cosmic provenance statement |
| `Verification_Endpoint` | Public authenticity validation route (`/api/verify-token`) |
| `Developer` | Lucas Gomes (github.com/luckhaosbb) |
| `Timestamp` | Exact ISO 8601 issuance timestamp |

### Cryptographic Authenticity Audit:

#### 1. Via Web Interface (Poster Page)
Directly at the bottom of the poster tab (`#poster`), visitors have access to the **Poster Authenticity Audit** section:
- **Instant Drag & Drop:** Users drag the downloaded PNG file into the dropzone. The browser parses binary `tEXt` chunks locally via `ArrayBuffer` (< 10ms, without uploading heavy files to the server) and transmits only the cryptographic payload for verification.
- **Token ID Lookup:** Allows inspecting any official edition using its `TOKEN#EXO-...` code.
- **Holographic Cryptographic Dossier:** Displays verification status (`VALID OFFICIAL CERTIFICATE` or `TAMPERED`), mintage number, registered collector name, official drop date, and HMAC-SHA256 protocol confirmation.

#### 2. Via Command Line Interface (CLI):
```bash
npm run verify-poster "path/to/your-poster.png"
```
The tool directly inspects the PNG binary structure, decodes the `tEXt` chunks, and recalculates the signature against the server key, reporting the mintage edition, collector name, and whether the artwork is genuine or tampered.

---

## 📬 Daily Notifications & Welcome System (Resend API)

The observatory integrates the **Resend** transactional API to guarantee email delivery directly to the **Primary Inbox**, avoiding spam filters and promotional tabs:

1. **Immediate Welcome Email:** Dispatched asynchronously as soon as a visitor registers via the newsletter form. Confirms registration with a clean layout and instructions regarding daily drops.
2. **Automated Daily Alerts (00:00:10 BRT):** A daily cron scheduler syncs the released exoplanet and sends a bulletin featuring lethality metrics, surface temperature, and a direct link to the A4 poster to all active subscribers.
3. **"Tyler Vigen" High-Deliverability Design:** Emails crafted in a minimalist, personal format with an accompanying plain-text (`text`) version, elevating sender reputation across Gmail/Outlook algorithms.
4. **Email Dispatch Test (CLI):**
```bash
npm run test-email "your-email@domain.com"
```

---

## 🚀 Getting Started

### 🌐 Instant Access (Live Observatory)
You don't need to run or install anything locally to explore the project. The platform is continuously deployed and live:  
👉 **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**

---

### Prerequisites (For Local Development)
- [Node.js](https://nodejs.org/) v18+ (LTS recommended)
- `npm` package manager

### Installation
```bash
# 1. Clone repository
git clone https://github.com/luckhaosbb/exoplanetas-extremos.git
cd exoplanetas-extremos

# 2. Install dependencies
npm install
```

### Environment Configuration
Create a `.env` file in the root directory:

Available configuration keys:
```env
PORT=3001
NODE_ENV=development
SERVER_SECRET_KEY=your_secret_crypto_key_here
DATABASE_URL=
COMING_SOON=false
LAUNCH_DATE=2026-09-28
```
*(Note: For quick local development, leave `DATABASE_URL` empty to utilize the zero-config JSON engine).*

### Running in Development
```bash
npm run dev
```
Launches both the Express backend server (port `3001`) and the Vite frontend with Hot Module Replacement (port `5173`).

### Production Build & Execution
```bash
npm run build
npm start
```

---

## 👨‍💻 Author & Project Links

Crafted with dedication by **Lucas Gomes**  
- 🪐 **Official Project Website:** [https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)  
- 💻 **Personal Portfolio:** [https://luckhaosbb.dev](https://luckhaosbb.dev)  
- 🐙 **GitHub:** [@luckhaosbb](https://github.com/luckhaosbb)  
- 💼 **LinkedIn:** [Lucas Gomes](https://www.linkedin.com/in/lucas-gomes-ab49582bb)

