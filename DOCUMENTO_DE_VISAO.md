# 🪐 DOCUMENTO DE VISÃO: EXOPLANETAS EXTREMOS (MUNDOS MORTAIS)

> 🌐 **Plataforma Oficial em Produção:** **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**  
> **"No espaço, ninguém pode ouvir você queimar, ser estraçalhado por vidro supersônico ou evaporar em chuva de ferro."**  
> *Inspirado no projeto "Galaxy of Horrors" da NASA.*

---

## 1. Visão Geral do Produto
O **Exoplanetas Extremos** (disponível publicamente em **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**) é uma experiência web interativa, atmosférica e geek focada em apresentar **um único exoplaneta mortal a cada 24 horas**. 

A cada dia, um novo mundo hostil é selecionado pelo sistema de forma inédita. A página revela detalhes científicos e aterrorizantes das condições extremas do planeta através de uma interface inspirada em terminais de ficção científica e monitores retrô (estética CRT/jogos espaciais). 

Ao final da jornada, o usuário tem acesso exclusivo a um **Pôster/Banner colecionável estilo Comic Book Vintage** na proporção **A4**, gerado e personalizado com as características mortais daquele planeta específico, contendo um **Token Criptográfico Único (estilo NFT de autenticidade)**, disponível para download apenas durante aquele dia.

---

## 2. Personas e Público-Alvo
- **Geeks, entusiastas de Ficção Científica e Astronomia:** Admiradores de exploração espacial, quadrinhos vintage (Marvel, EC Comics, anos 60–80) e histórias cósmicas extremas.
- **Estudantes e Curiosos:** Pessoas atraídas por fatos científicos reais contados de maneira envolvente e cinematográfica.
- **Colecionadores Digitais:** Usuários estimulados pelo conceito de "drop diário", retornando todo dia para garantir o pôster exclusivo com chave de autenticidade criptografada daquela data antes que o planeta do dia expire.

---

## 3. Regras de Negócio, Automação & Ciclos Semanais

### 3.1. O Ciclo Semanal Estruturado (Segunda a Domingo)
- O sistema opera em **Semanas Cósmicas Fechadas (Segunda-feira 00:00 a Domingo 23:59)**.
- **O Disparo de Sábado (00:00):** Todo sábado à meia-noite, o agendador em background (`cronService`) entra em ação. Faltando apenas o drop de domingo para encerrar a semana corrente, o sistema bloqueia e agenda a **Próxima Semana completa (Segunda a Domingo)** no banco de dados.
- O domingo roda o último drop da semana atual sem perturbações, e na segunda-feira à 00:00 o primeiro planeta da nova semana estreia instantaneamente sem dependência de processamentos pesados.

### 3.2. Motor de IA em Cascata (Cascade Fallback Chain - Alta Disponibilidade)
- O backend Node.js implementa uma **Cascata de Redundância Multi-Provedores** para garantir 100% de disponibilidade nos agendamentos de sábado:
  - **Rota 1 (Principal):** SiliconFlow (`black-forest-labs/FLUX.1-schnell`), para geração ultrarrápida em 2 segundos sem marcas d'água.
  - **Rota 2 (Secundária):** Hugging Face Serverless Inference API (`black-forest-labs/FLUX.1-schnell` via token `HF_TOKEN`).
  - **Rota 3 (Rede de Segurança Infalível):** Pollinations.ai (Flux), 100% gratuito e sem dependência de chaves de API.
- **Estratégia Anti-Erro 429 & Retries:** Processamento sequencial com delay de segurança entre exoplanetas e retry automático com backoff exponencial. Detalhes completos no documento [ARCHITECTURE_AI_PIPELINE.md](file:///C:/Users/Lucas/Downloads/Daily%20Exoplanets/ARCHITECTURE_AI_PIPELINE.md).
- As imagens são gravadas localmente nas pastas `server/assets/planets/` e `public/assets/planets/` no padrão **100% Full-Bleed**.

### 3.3. Banco de Dados Incremental (Sem dependência de 364 planetas no D0)
- O banco de dados cresce de forma sustentável e orgânica em lotes de **7 exoplanetas por semana**.
- A cada sábado, o sistema agenda os próximos 7 mundos a partir da fila do catálogo/NASA TAP API, atribuindo as fichas técnicas, títulos temáticos e chaves criptográficas sem exigir que o banco possua um ano inteiro pré-cadastrado no dia do lançamento.

### 3.4. Exclusividade e Efemeridade para o Visitante
- O visitante público tem acesso **somente ao exoplaneta e banner do dia atual**.
- Um relógio de contagem regressiva em tempo real ("Próximo Salto Orbital em: HH:MM:SS") alerta sobre o tempo restante para explorar aquele mundo e baixar o pôster antes da virada da meia-noite.
- Não há arquivo público de downloads passados, mantendo o apelo de escassez e drop diário.

---

## 4. Experiência Visual e Especificação Técnica

### 4.1. Estética Geral: "Sci-Fi CRT Terminal"
- **Tema:** Dark space com paleta contrastante, gradientes cósmicos profundos e atmosfera de observatório científico retrofuturista.
- **Efeito Visual CRT:** Linhas de varredura (*scanlines* sutis), aberração cromática leve, moldura estilo monitor de sonda espacial, tipografia técnica monospaçada e headers marcantes.
- **Áudio Imersivo:** Efeitos sonoros sci-fi opcionais (cliques analógicos, bipes de escaneamento de sensores, alertas de perigo biológico).

### 4.2. Visualizador 3D com Percepção Fiel de Giro e Interatividade
- Renderização tridimensional interativa do exoplaneta com sensibilidade imediata e inércia física tangível.
- **Marcas de Superfície e Relevo 3D:**
  - Vórtices atmosféricos, correntes de cisalhamento e faixas de tempestade com projeção senoidal 3D que cruzam a face do planeta conforme ele gira, tornando o giro e a profundidade esférica claramente visíveis.
  - *HD 189733b:* Nuvens azuladas com o Grande Vórtice de Silicato e partículas horizontais de vidro supersônico a Mach 7.
  - *WASP-76b:* Face diurna superaquecida com condensação e chuva de ferro fundido líquido.
  - *KELT-9b:* Atmosfera de plasma estelar com labaredas solares e brilho ultravioleta letal.
  - *TrES-2b:* Planeta mais escuro que carvão, emitindo apenas uma tênue e sinistra luminescência avermelhada de calor interno.
  - *55 Cancri e:* Superfície de lava de carbono/silício sob pressão gerando chuvas de diamantes cintilantes.
  - *WASP-12b:* Deformação gravitacional mútua em formato oval ("ovo cósmico") sendo canibalizado por sua estrela.
  - *PSR B1257+12c (Poltergeist):* Bombardeamento de raios gama e arcos elétricos gerados por pulsar.
- **Responsividade Total:** Redimensionamento dinâmico sem distorção em telas móveis, tablets e monitores ultrawide via `ResizeObserver`.

### 4.3. Dossiê Científico e Simulador de Sobrevivência
- Ficha técnica completa (Temperatura em °C e °F, Distância em anos-luz, Gravidade, Composição Atmosférica, Estrela Hospedeira).
- **Tempo Estimado de Sobrevivência Humana:** Calculadora fatal detalhando os milissegundos/segundos que um traje espacial ou humano suportaria e a causa biológica imediata da destruição.
- **Selo de Validação Científica:** Integração com dados reais do NASA Exoplanet Archive TAP API.

---

## 5. Gerador de Banner/Pôster Comic A4 (Redefinição Visual Autoral)

### 5.1. Conceito do Pôster
Arte limpa, autoral e com forte identidade de graphic novel cósmica vintage (estilo anos 70 / Jack Kirby), em padrão **100% Full-Bleed (sem bordas de papel, sem moldura externa de gibi)**, permitindo que a arte sangrada ocupe todo o pôster A4 e os selos oficiais flutuem diretamente sobre o cosmos.

### 5.2. Elementos Gráficos do Banner
1. **Composição 100% Full-Bleed (Zero Bordas e Zero Poluição Visual):**
   - **Sem margens de papel ou molduras de gibi:** A arte estende-se até o último pixel em todas as 4 direções, preenchendo completamente o canvas A4 tanto em orientações horizontais quanto verticais.
   - **Sem caixas de especificações e sem textos adicionais:** Toda informação secundária fica na página web, liberando o pôster para impacto visual cinematográfico puro.
2. **Selo de Autoridade Cósmica:**
   - Mantido o selo vintage no canto superior direito: *"APPROVED BY THE COSMIC ARCHIVE AUTHORITY ★ NASA ★"*.
3. **Box de Identificação Retrô:**
   - Mantido no canto superior esquerdo o selo *"ISSUE #001"* estilizado em amarelo e vermelho.
4. **Plaqueta com Nome Oficial do Exoplaneta:**
   - No canto inferior esquerdo, plaqueta vintage amarela clássica com o nome do mundo (ex: *"WASP-76b"*, *"HD 189733b"*).
5. **Título Único e Temático do Planeta:**
   - Cada exoplaneta recebe um título temático integrado organicamente na arte gerada (ex: *"THE RAZOR RAIN HORROR"*, *"THE IRON DELUGE"*, *"THE STELLAR FURNACE"*), com tipografia de quadrinhos com extrusão 3D e contorno de nanquim.
6. **Protocolo de Tiragem Numerada de Colecionador (Numbered Collector Mintage):**
   - **Democratização & Posse Individualizada:** Todos os visitantes podem baixar o pôster oficial em resolução máxima (A4 300 DPI, sem marcas d'água e sem paywall). Cada download emite atômica e sequencialmente o próximo número de tiragem (`#0001`, `#0002`, `#0042`...).
   - **Registro de Titularidade Criptográfica:** O colecionador pode informar seu nome ou codinome no modal de emissão, que é assinado matematicamente pelo backend com **HMAC-SHA256**.
   - **Metadados Binários Injetados:** O token, a assinatura digital, o número do exemplar e a data do drop são gravados na estrutura binária do PNG (chunks `tEXt`), preservando a arte visual 100% limpa, pura e cinematográfica.
   - **Auditoria de Autenticidade (Web & CLI):** Verificação instantânea tanto na interface web pública (via drag-and-drop na aba do pôster com extração client-side e consulta de Token ID) quanto no terminal via comando `npm run verify-poster <arquivo.png>`, com detecção matemática imediata de qualquer adulteração.
7. **Download em Alta Resolução (A4 300 DPI):**
   - Proporção exata A4: Vertical (`2480 × 3508px`) ou Horizontal (`3508 × 2480px`).

---

## 6. Integrações, Curadoria & Assinatura de Autoria
- **Painel de Curadoria Semanal do Autor (`npm run curadoria`):**
  - Módulo confidencial para o autor inspecionar e auditar antecipadamente os 7 exoplanetas da próxima semana.
  - Exibe o status das artes (`● Arte Pronta` ou `○ Aguardando`), o preview do pôster A4 Full-Bleed e botão **"🔄 Regenerar Arte (Google Imagen 3)"** para regerar qualquer ilustração individualmente com um clique.
  - Botão **"⚡ Executar Ciclo da Próxima Semana"** para disparar o agendamento e a fila de geração sob demanda a qualquer momento.
- **Seção de Autoria no Rodapé & Links Oficiais:**
  - **Website Oficial da Aplicação:** [https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)
  - Link direto para o perfil do desenvolvedor no **GitHub** (`https://github.com/luckhaosbb`).
  - Link direto para o perfil profissional no **LinkedIn** (`https://www.linkedin.com/in/lucas-gomes-ab49582bb`).
  - Link direto para contato via **WhatsApp** (`https://wa.me/5585997893548`).
  - Link para o portfólio pessoal (`https://luckhaosbb.dev`).
  - Informações de créditos acadêmicos e dados da NASA Exoplanet Archive.

---

## 7. Arquitetura do Sistema e Estrutura de Pastas (SOLID & Clean Architecture)

```
Daily Exoplanets/
├── ARCHITECTURE_AI_PIPELINE.md      # Arquitetura do pipeline de IA e Cascade Fallback Chain
├── DOCUMENTO_DE_VISAO.md            # Documento de visão do produto
├── FSD.md                           # Especificação funcional detalhada (FSD)
├── README.md                        # Documentação técnica e guia de execução
├── scripts/
│   └── curadoria.js                 # Launcher de inspeção semanal com token HMAC seguro
├── server/                          # Backend Node.js / Express (Arquitetura em Camadas)
│   ├── assets/planets/              # Acervo confidencial de artes oficiais Full-Bleed
│   ├── config/index.js              # Configurações tipadas de ambiente (PORT, Chaves, IA)
│   ├── controllers/                 # Camada de apresentação (HTTP Controllers)
│   │   ├── authController.js
│   │   ├── cryptoController.js
│   │   ├── planetController.js      # Rotas de exoplanetas, curadoria e regeneração
│   │   └── subscriberController.js
│   ├── data/
│   │   ├── exoplanets.js            # Catálogo e metadados astronômicos
│   │   └── prompts.js               # Acervo e construtor de prompts homologados Full-Bleed
│   ├── services/                    # Camada de regras de negócio
│   │   ├── aiImageService.js        # Fila e integração com Google Cloud Imagen 3
│   │   ├── authService.js           # Gestão de tokens de sessão HMAC-SHA256
│   │   ├── cronService.js           # Agendador cron do ciclo de sábado à meia-noite
│   │   ├── cryptoService.js         # Emissão de certificados NFT-like
│   │   ├── planetService.js         # Orquestração do ciclo de vida e agendamento semanal
│   │   └── subscriberService.js
│   ├── repositories/                # Camada de acesso a dados (Híbrido Postgres/JSON)
│   │   ├── database.js
│   │   ├── planetRepository.js
│   │   └── subscriberRepository.js
│   ├── middlewares/authMiddleware.js# Guardião de autenticação de curadoria
│   ├── routes/api.js                # Roteador desacoplado Express
│   └── server.js                    # Bootstrap do servidor, cron e headers de segurança
├── src/
│   ├── components/
│   │   ├── comicBannerGenerator.js  # Motor procedural A4 Full-Bleed com injeção de chunks tEXt
│   │   ├── curadoriaModule.js       # Interface do observatório de curadoria e regeneração IA
│   │   ├── planetRenderer.js        # Motor 3D responsivo com relevo orbital e inércia física
│   │   ├── nasaApi.js               # Conexão assíncrona com NASA TAP API
│   │   └── soundEffects.js          # Sistema de áudio sintetizado Web Audio API
│   ├── data/exoplanets.js           # Fallback estático de emergência offline
│   ├── style.css                    # Estilização sci-fi terminal CRT e galeria A4
│   └── main.js                      # Orquestrador SPA, roteamento e eventos
├── index.html                       # Aplicação web imersiva
├── package.json                     # Scripts e dependências (node-cron, etc.)
└── vite.config.js                   # Configuração Vite e proxy de desenvolvimento
```
