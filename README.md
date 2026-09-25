# 🪐 Extreme Exoplanets (Daily Extreme Exoplanet Archive)

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-336791.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Architecture](https://img.shields.io/badge/Architecture-SOLID%20Clean%20Design-blueviolet.svg?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)]()

> **"In space, no one can hear you burn, get shredded by supersonic glass, or evaporate in iron rain."**  
> *An interactive experience featuring retro-futuristic sci-fi aesthetics, inspired by NASA's "Galaxy of Horrors" and the Golden Age of Comic Books.*

---

## 🌌 Overview

**Extreme Exoplanets** is a full-stack web application designed with enterprise-grade software engineering standards and senior systems design principles. The platform delivers **one deadly exoplanet every 24 hours** in an automated *Daily Drop* schedule, guaranteeing a non-repeating astronomical rotation cycle until catalog exhaustion.

### Core Features:
1. **3D Telemetry CRT Sensor (Retro-futuristic Aesthetic):** Interactive spherical physics renderer with damped angular inertia, 3D dynamic lighting, scanlines, and custom atmospheric relief shaders unique to each world (Mach 7 silicate rain, stellar plasma, molten iron deluges, etc.).
2. **Vintage Comic Book A4 Poster (300 DPI):** Procedural artwork generator delivering classic vintage comic covers, automatically stamping issue sequencing (`ISSUE #001`, `ISSUE #002`), embossed bespoke typography, Ben-Day halftone grids, and cosmic approval stamps.
3. **Invisible Cryptographic Watermark (NFT-like Provenance):** W3C standard binary chunk injection (`tEXt` chunks with CRC-32 integrity validation) directly into the generated PNG file stream. Server-side digital signatures utilize **HMAC-SHA256**, ensuring immutable and verifiable authenticity via the `/api/verify-token` endpoint.
4. **Daily Tyler Vigen-Style Notifications:** Minimalist, distraction-free newsletter alert system for upcoming daily drops.
5. **Live Scientific Telemetry:** Asynchronous synchronization with NASA's TAP Exoplanet Archive API for real-time astronomical verification.

---

## 🏛️ Software Architecture & SOLID Principles

The backend is built following **Layered Clean Architecture** and strictly adheres to the five **SOLID** principles:

```
server/
├── config/                  # Centralized typed environment configurations
│   └── index.js
├── data/                    # Astronomical catalog and resilient local storage
│   ├── exoplanets.js
│   ├── published_planets.json
│   └── subscribers.json
├── repositories/            # Data Access Layer (Persistence)
│   ├── database.js          # PostgreSQL Connection Pool with auto-migrating DDL
│   ├── planetRepository.js  # Exoplanet queries and mutations abstraction
│   └── subscriberRepository.js # Subscriber queries and mutations abstraction
├── services/                # Business Logic Layer
│   ├── cryptoService.js     # HMAC-SHA256 signature generation and validation
│   ├── planetService.js     # Daily drop rotation orchestration without repetition
│   └── subscriberService.js # RFC email validation and subscription sanitization
├── controllers/             # Presentation Layer (HTTP API Controllers)
│   ├── cryptoController.js
│   ├── planetController.js
│   └── subscriberController.js
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

## 🔐 Cryptographic Poster Specification

When generating the A4 PNG poster download, the generator injects standardized binary chunks immediately preceding the `IEND` marker:

| PNG Chunk Key | Description |
| :--- | :--- |
| `NFT_Token_ID` | Unique drop series identifier (`TOKEN#EXO-YYYYMMDD-XXXXXX`) |
| `HMAC_Signature` | Cryptographic signature computed on the server using private key |
| `Exoplanet_ID` | Astronomical catalog identifier (e.g., `hd-189733b`) |
| `Drop_Date` | Official drop date timestamp (`YYYY-MM-DD`) |
| `Authenticity` | Official statement of digital provenance |
| `Developer` | Lucas Gomes (github.com/luckhaosbb) |

---

## 🚀 Getting Started

### Prerequisites
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
Create a `.env` file from the provided template:
```bash
cp .env.example .env
```

Available configuration keys:
```env
PORT=3001
NODE_ENV=development
SERVER_SECRET_KEY=your_secret_crypto_key_here
DATABASE_URL=
COMING_SOON=true
LAUNCH_DATE=2026-09-25
CURADORIA_SECRET=obs_k7x9m2_luckhaos
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

## 👨‍💻 Author

Crafted by **Lucas Gomes**  
- GitHub: [@luckhaosbb](https://github.com/luckhaosbb)  
- Website: [luckhaosbb.dev](https://luckhaosbb.dev)
