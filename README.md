# 🪐 Extreme Exoplanets (Daily Extreme Exoplanet Archive)

<div align="center">

[![Website](https://img.shields.io/badge/🌐_VISIT_LIVE_WEBSITE-exoplanets.luckhaosbb.dev-00f0ff?style=for-the-badge&logo=googlechrome&logoColor=black)](https://exoplanets.luckhaosbb.dev/)
[![Status](https://img.shields.io/badge/STATUS-ONLINE%20%2F%20PRODUCTION-success?style=for-the-badge)](https://exoplanets.luckhaosbb.dev/)
[![NASA TAP API](https://img.shields.io/badge/NASA%20TAP-LIVE%20SYNC-informational?style=for-the-badge&logo=nasa)](https://exoplanets.luckhaosbb.dev/)

### 🚀 **Acesse o Observatório em Produção:**  
# 👉 **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)** 👈

*Explore daily extreme exoplanets, interactive 3D retro CRT orbital telemetry, and mint your authenticated A4 vintage comic poster before midnight.*

---

[![Production Web](https://img.shields.io/badge/Live_URL-https%3A%2F%2Fexoplanets.luckhaosbb.dev-00f0ff.svg?style=flat-square&logo=firefoxbrowser)](https://exoplanets.luckhaosbb.dev/)
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
6. **Curator Dashboard (`npm run curadoria`):** Confidential author observation deck to inspect the weekly 7-day queue, preview official posters with live badges, and download authenticated drops in advance.
7. **Cascade Fallback Chain AI Pipeline:** Autonomous weekly batch generation running every Saturday at 00:00:00 with 4-tier zero-failure redundancy (SiliconFlow -> Cloudflare Workers AI -> Hugging Face -> Pollinations.ai). Detailed in [`ARCHITECTURE_AI_PIPELINE.md`](ARCHITECTURE_AI_PIPELINE.md).

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

## 🔐 Protocolo de Tiragem Numerada & Certificação Criptográfica (Numbered Collector Mintage)

Diferente de sistemas que restringem o acesso ao arquivo com marcas d'água ou bloqueios artificiais, o **Exoplanetas Extremos** adota o modelo clássico de **Litografia Digital / Gravura Numerada de Colecionador**:

- **Acesso Universal & Qualidade Máxima:** Qualquer visitante pode baixar a arte original em resolução máxima (A4 300 DPI, sem marcas d'água, sem paywalls).
- **Exemplar Oficial Exclusivo:** Cada download emite atômica e sequencialmente o próximo número de tiragem do drop diário (`#0001`, `#0002`, `#0042`...).
- **Titularidade Registrada:** O visitante pode registrar seu nome ou codinome de colecionador (ou optar por emissão anônima oficial).
- **Assinatura HMAC-SHA256:** O servidor assina matematicamente a tupla `(Exoplaneta + Data + Número de Série + Nome do Titular + Entropia)` com sua chave privada mestre.
- **Injeção Binária Invisível (Chunks tEXt):** O motor de renderização client-side (`ComicBannerGenerator`) sintetiza o PNG e injeta a certidão invisível antes do marcador `IEND`, com verificação de integridade CRC-32.
- **Arte Visual 100% Pura:** A arte permanece completamente limpa e cinematográfica, sem nenhum texto de código, hash ou carimbo poluindo o desenho. Toda a posse reside nos metadados binários oficiais.

### Especificação dos Chunks PNG Binários:

| Chave do Chunk `tEXt` | Descrição do Dado |
| :--- | :--- |
| `Exoplanet_ID` | Identificador único do exoplaneta no catálogo astronômico (ex: `hd-189733b`) |
| `Exoplanet_Name` | Nome astronômico oficial (ex: `HD 189733b`) |
| `Title` | Título temático da capa estilo gibi (ex: `THE RAZOR RAIN HORROR`) |
| `Drop_Date` | Data oficial do drop diário (`YYYY-MM-DD`) |
| `Mint_Number` | Número sequencial do exemplar emitido (ex: `EDIÇÃO #0001`) |
| `Collector_Name` | Nome ou codinome registrado do titular/colecionador |
| `NFT_Token_ID` | Token de identificação único (`TOKEN#EXO-YYYYMMDD-0001-XXXX`) |
| `HMAC_Signature` | Assinatura criptográfica calculada no servidor com chave privada (`SHA256:...`) |
| `Serial_Entropy` | Entropia aleatória de 8 caracteres para proteção contra colisões |
| `Authenticity` | Declaração oficial de proveniência cósmica |
| `Verification_Endpoint` | Rota pública para validação de autenticidade (`/api/verify-token`) |
| `Developer` | Lucas Gomes (github.com/luckhaosbb) |
| `Timestamp` | Carimbo ISO 8601 exato de emissão |

### Auditoria Criptográfica de Autenticidade:

#### 1. Via Interface Web (Página do Pôster)
Diretamente no final da aba do pôster (`#poster`), o usuário conta com a seção **Auditoria de Autenticidade do Pôster**:
- **Drag & Drop Instantâneo:** O usuário arrasta o arquivo PNG baixado para a dropzone. O navegador extrai os chunks binários `tEXt` localmente via `ArrayBuffer` (em < 10ms, sem upload de arquivos pesados para o servidor) e envia apenas o payload criptográfico para validação.
- **Validação por Token ID:** Permite pesquisar qualquer exemplar oficial através do seu código `TOKEN#EXO-...`.
- **Dossiê Criptográfico Holográfico:** Exibe o status da validação (`CERTIFICADO OFICIAL VÁLIDO` ou `ADULTERADO`), número da tiragem, nome do titular registrado, data oficial do drop e confirmação do protocolo HMAC-SHA256.

#### 2. Via Linha de Comando (CLI):
```bash
npm run verify-poster "caminho/para/seu-poster.png"
```
A ferramenta lê diretamente a estrutura binária do arquivo PNG, decodifica os chunks `tEXt` e calcula a assinatura contra a chave do servidor, informando o número da tiragem, o nome do titular e se o arquivo é autêntico ou adulterado.

---

## 📬 Sistema de Notificações Diárias & Boas-Vindas (Resend API)

O observatório integra a API transacional do **Resend** para entrega de e-mails com garantia de recebimento na **Caixa Principal (Primary Inbox)**, evitando filtros de spam e a aba de promoções:

1. **E-mail de Boas-Vindas Imediato:** Disparado de forma assíncrona assim que o usuário realiza a inscrição no formulário. Confirma a inscrição com layout limpo e instruções sobre os drops.
2. **Alertas Diários Automatizados (00:00:10 BRT):** Agendador cron diário que sincroniza o planeta liberado e envia um boletim com dados de letalidade, temperatura e link direto para o pôster A4 a todos os assinantes ativos.
3. **Padrão de Entregabilidade "Tyler Vigen":** E-mails diagramados em formato pessoal e minimalista com versão paralela em texto puro (`text`), elevando a reputação de entrega perante o algoritmo do Gmail/Outlook.
4. **Comando de Teste de E-mail (CLI):**
```bash
npm run test-email "seu-email@dominio.com"
```

---

## 🚀 Getting Started

### 🌐 Instant Access (Production Live Demo)
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

### Weekly Curator Dashboard (Author Access)
```bash
npm run curadoria
```
Generates a secure HMAC-SHA256 session token and opens the confidential author dashboard in your default browser to inspect upcoming exoplanets, preview live A4 comic banners, and download high-resolution authenticated drops.

### Production Build & Execution
```bash
npm run build
npm start
```

---

## 👨‍💻 Author & Project Links

Crafted with dedication by **Lucas Gomes**  
- 🪐 **Website Oficial do Projeto:** [https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)  
- 💻 **Portfólio Pessoal:** [https://luckhaosbb.dev](https://luckhaosbb.dev)  
- 🐙 **GitHub:** [@luckhaosbb](https://github.com/luckhaosbb)  
- 💼 **LinkedIn:** [Lucas Gomes](https://www.linkedin.com/in/lucas-gomes-ab49582bb)

