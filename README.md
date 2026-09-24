# 🪐 Exoplanetas Extremos (Daily Extreme Exoplanets)

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-336791.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Architecture](https://img.shields.io/badge/Architecture-SOLID%20Clean%20Design-blueviolet.svg?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)]()

> **"No espaço, ninguém pode ouvir você queimar, ser estraçalhado por vidro supersônico ou evaporar em chuva de ferro."**  
> *Uma experiência interativa com estética sci-fi retrofuturista, inspirada no acervo "Galaxy of Horrors" da NASA e na Era de Ouro dos Quadrinhos.*

---

## 🌌 Visão Geral

O **Exoplanetas Extremos** é uma aplicação web full-stack desenvolvida sob padrões corporativos de engenharia de software e análise de sistemas sênior. O sistema disponibiliza **um único exoplaneta mortal a cada 24 horas** em regime de *Daily Drop*, garantindo um ciclo de rotação diário sem repetições até a exaustão do catálogo astronômico.

### Principais Funcionalidades:
1. **Sensor Telemétrico 3D (Estética CRT Retrofuturista):** Renderizador interativo de física esférica com inércia angular amortecida, iluminação tridimensional, scanlines e marcas de relevo atmosférico exclusivas para cada planeta (chuva de silicato a Mach 7, plasma solar, tempestades de ferro derretido, etc.).
2. **Pôster Comic Book A4 (300 DPI):** Gerador visual de capas clássicas de quadrinhos *vintage*, integrando automaticamente a numeração sequencial da edição (`ISSUE #001`, `ISSUE #002`), tipografia autoral em relevo, retículas Ben-Day e carimbo de aprovação cósmica.
3. **Chave Criptográfica Invisível (NFT-like Provenance):** Injeção de metadados binários oficiais W3C (`tEXt` chunks com verificação de integridade CRC-32) diretamente no fluxo do arquivo PNG gerado. A assinatura digital utiliza **HMAC-SHA256** no servidor, garantindo autenticidade imutável e verificável através do endpoint `/api/verify-token`.
4. **Assinatura Diária (Estilo Tyler Vigen):** Newsletter minimalista e livre de distrações para alerta de novos drops astronômicos.
5. **Integração Científica ao Vivo:** Conexão assíncrona com a API TAP do *NASA Exoplanet Archive* para validação de métricas de catálogo em tempo real.

---

## 🏛️ Arquitetura de Software & Princípios SOLID

O backend foi integralmente refatorado seguindo **Arquitetura em Camadas (Layered Clean Architecture)** e os cinco princípios **SOLID**:

```
server/
├── config/                  # Centralização e tipagem de variáveis de ambiente
│   └── index.js
├── data/                    # Catálogo astronômico e armazenamento resiliente local
│   ├── exoplanets.js
│   ├── published_planets.json
│   └── subscribers.json
├── repositories/            # Camada de Persistência (Data Access Layer)
│   ├── database.js          # Connection Pool do PostgreSQL com DDL auto-migrável
│   ├── planetRepository.js  # Abstração de queries/mutações de exoplanetas
│   └── subscriberRepository.js # Abstração de queries/mutações de assinantes
├── services/                # Camada de Regras de Negócio (Business Logic Layer)
│   ├── cryptoService.js     # Geração e validação de assinaturas HMAC-SHA256
│   ├── planetService.js     # Orquestração do ciclo diário e seleção sem repetição
│   └── subscriberService.js # Validação RFC e saneamento de assinaturas
├── controllers/             # Camada de Apresentação HTTP (API Controllers)
│   ├── cryptoController.js
│   ├── planetController.js
│   └── subscriberController.js
├── routes/                  # Roteamento desacoplado
│   └── api.js
└── server.js                # Bootstrap do Express e fallback SPA estático
```

### Como os Princípios SOLID são Aplicados:
- **S - Single Responsibility Principle (SRP):** Cada serviço e repositório possui uma única responsabilidade de domínio bem delineada. O `cryptoService` manipula apenas integridade criptográfica, enquanto `planetService` orquestra regras de publicação e rotação.
- **O - Open/Closed Principle (OCP):** A camada de repositórios permite estender provedores de banco de dados (ex: migrar para MongoDB ou DynamoDB) sem necessidade de alterar as regras de negócio dos serviços.
- **L - Liskov Substitution Principle (LSP):** O repositório unificado garante os mesmos contratos de dados seja executando em PostgreSQL de nuvem ou em JSON persistente local.
- **I - Interface Segregation Principle (ISP):** Repositórios e controladores possuem contratos enxutos, expondo estritamente as operações necessárias.
- **D - Dependency Inversion Principle (DIP):** Os controladores dependem dos serviços, e os serviços dependem das abstrações de repositórios, nunca acessando o driver do banco ou o sistema de arquivos diretamente.

---

## 🐘 Persistência de Dados Dual-Engine

O projeto adota uma estratégia de **resiliência híbrida**:
- **PostgreSQL (Nuvem / Produção):** Ativado automaticamente quando a variável de ambiente `DATABASE_URL` está preenchida (ex: no Render, Supabase, Neon ou AWS RDS). As tabelas (`published_planets` e `subscribers`) são criadas de forma idempotente na inicialização.
- **JSON Engine (Desenvolvimento Local Zero-Config):** Se `DATABASE_URL` não for informada, o sistema aciona transparentemente o fallback em arquivos JSON persistentes em `server/data/`, eliminando a obrigatoriedade de inicializar containers Docker para testes locais ou acadêmicos.

---

## 🔐 Especificação Criptográfica do Pôster

Ao gerar o download do pôster A4 em PNG, o motor injeta chunks binários padronizados antes do terminador `IEND`:

| Propriedade no PNG | Descrição |
| :--- | :--- |
| `NFT_Token_ID` | Identificador único de série (`TOKEN#EXO-YYYYMMDD-XXXXXX`) |
| `HMAC_Signature` | Assinatura digital calculada no servidor com chave privada secreta |
| `Exoplanet_ID` | Código identificador astronômico (ex: `hd-189733b`) |
| `Drop_Date` | Data oficial do drop (`YYYY-MM-DD`) |
| `Authenticity` | Declaração oficial de proveniência |
| `Developer` | Lucas Gomes (github.com/luckhaosbb) |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18+ (recomendado LTS)
- Gerenciador de pacotes `npm`

### Instalação
```bash
# 1. Clonar o repositório
git clone https://github.com/luckhaosbb/exoplanetas-extremos.git
cd exoplanetas-extremos

# 2. Instalar as dependências do projeto
npm install
```

### Configuração de Variáveis de Ambiente
Copie o arquivo de exemplo para criar o `.env`:
```bash
cp .env.example .env
```
Campos disponíveis:
```env
PORT=3001
NODE_ENV=development
SERVER_SECRET_KEY=sua_chave_secreta_aqui
DATABASE_URL=
```
*(Nota: Para execução local rápida, mantenha `DATABASE_URL` vazia).*

### Executando em Desenvolvimento
```bash
npm run dev
```
O comando iniciará simultaneamente o servidor backend Express (porta `3001`) e o Vite frontend com HMR (porta `5173`).

### Compilação e Execução de Produção
```bash
npm run build
npm start
```

---

## 🌐 Deploy em Produção (Render.com)

1. Crie uma conta no [Render](https://render.com/).
2. Conecte o repositório GitHub `luckhaosbb/exoplanetas-extremos`.
3. Escolha a opção **Web Service** com as seguintes definições:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Na aba **Environment Variables**, adicione:
   - `NODE_ENV`: `production`
   - `SERVER_SECRET_KEY`: *[Chave aleatória gerada para assinatura]*
   - `DATABASE_URL`: *[URL da instância PostgreSQL no Render]*
5. Configure seu domínio customizado (`luckhaosbb.dev` ou `exoplanetas.luckhaosbb.dev`) apontando os registros CNAME/A no seu provedor de DNS conforme fornecido pelo painel do Render.

---

## 👨‍💻 Autor

Desenvolvido por **Lucas Gomes**  
- GitHub: [@luckhaosbb](https://github.com/luckhaosbb)  
- Website: [luckhaosbb.dev](https://luckhaosbb.dev)
