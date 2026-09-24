# 🪐 DOCUMENTO DE VISÃO: EXOPLANETAS EXTREMOS (MUNDOS MORTAIS)

> **"No espaço, ninguém pode ouvir você queimar, ser estraçalhado por vidro supersônico ou evaporar em chuva de ferro."**  
> *Inspirado no projeto "Galaxy of Horrors" da NASA.*

---

## 1. Visão Geral do Produto
O **Exoplanetas Extremos** é uma experiência web interativa, atmosférica e geek focada em apresentar **um único exoplaneta mortal a cada 24 horas**. 

A cada dia, um novo mundo hostil é selecionado pelo sistema de forma inédita. A página revela detalhes científicos e aterrorizantes das condições extremas do planeta através de uma interface inspirada em terminais de ficção científica e monitores retrô (estética CRT/jogos espaciais). 

Ao final da jornada, o usuário tem acesso exclusivo a um **Pôster/Banner colecionável estilo Comic Book Vintage** na proporção **A4**, gerado e personalizado com as características mortais daquele planeta específico, contendo um **Token Criptográfico Único (estilo NFT de autenticidade)**, disponível para download apenas durante aquele dia.

---

## 2. Personas e Público-Alvo
- **Geeks, entusiastas de Ficção Científica e Astronomia:** Admiradores de exploração espacial, quadrinhos vintage (Marvel, EC Comics, anos 60–80) e histórias cósmicas extremas.
- **Estudantes e Curiosos:** Pessoas atraídas por fatos científicos reais contados de maneira envolvente e cinematográfica.
- **Colecionadores Digitais:** Usuários estimulados pelo conceito de "drop diário", retornando todo dia para garantir o pôster exclusivo com chave de autenticidade criptografada daquela data antes que o planeta do dia expire.

---

## 3. Regras de Negócio e Lógica de Rotação

### 3.1. O Drop Diário (Daily Extreme Exoplanet)
- O sistema opera em ciclos de 24 horas sincronizados com a meia-noite (00:00).
- Um relógio de contagem regressiva em tempo real ("Próximo Salto Orbital em: HH:MM:SS") alerta sobre o tempo restante para explorar aquele planeta e baixar o banner.

### 3.2. Regra de Não Repetição & Banco de Dados
- **Ineditismo Garantido:** Antes de selecionar o planeta do dia, o sistema consulta o banco de dados para recuperar o histórico de planetas já publicados.
- O planeta selecionado **nunca se repetirá** até que o catálogo de mundos extremos seja esgotado.
- Todas as informações do planeta publicado, métricas geradas, chaves criptográficas e o banner definitivo são persistidos no banco de dados (PostgreSQL com fallback resiliente).

### 3.3. Exclusividade e Efemeridade para o Usuário
- O usuário tem acesso **somente ao planeta e banner do dia atual**.
- Não há arquivo público ou navegação livre por planetas passados na interface padrão, gerando expectativa e valor para cada drop diário.
- Os dados históricos ficam guardados no banco de dados com acesso restrito/administrativo.

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
Arte limpa, autoral e com forte identidade de capa de quadrinhos clássicos (estilo Marvel pulp anos 60/70), sem caixas pesadas que poluam a ilustração.

### 5.2. Elementos Gráficos do Banner
1. **Composição Limpa e Artística (Zero Poluição Visual):**
   - **Sem barras artificiais:** A arte e o espaço cósmico ocupam todo o pôster sem caixas pesadas.
   - **Sem caixas de especificações e sem textos adicionais:** Toda informação secundária fica na página web, liberando o pôster para impacto visual cinematográfico puro.
2. **Selo de Autoridade Cósmica:**
   - Mantido o selo vintage no canto superior direito: *"APPROVED BY THE COSMIC ARCHIVE AUTHORITY ★ NASA ★"*.
3. **Box de Identificação Retrô:**
   - Mantido no canto superior esquerdo o selo *"ISSUE #01 - EXTREME WORLDS DAILY"* (sem preço).
4. **Título Único e Temático do Planeta:**
   - Cada exoplaneta recebe um título temático de gibi em destaque no topo (ex: *"THE RAZOR RAIN HORROR"*, *"THE IRON DELUGE"*), com tipografia de quadrinhos com extrusão 3D e contorno de nanquim.
5. **Chave Criptográfica Invisível em Metadados Binários (NFT-like Provenance):**
   - Em vez de poluir a arte visual com textos, a **Chave Criptográfica Única (Token NFT)**, a data oficial do drop e o certificado são gravados **diretamente nos blocos binários de metadados do arquivo PNG (chunks oficiais `tEXt`)**. O usuário baixa um pôster 100% limpo, mas que carrega o certificado embutido em seu código para sempre.
6. **Download em Alta Resolução (A4):**
   - Proporção exata A4 (Vertical ou Horizontal conforme o planeta, ex: 2480 × 3508 pixels em 300 DPI).
   - Formato PNG com metadados binários prontos para impressão ou validação digital.

---

## 6. Integrações & Assinatura de Autoria
- **Seção de Autoria no Rodapé:**
  - Link direto para o perfil do desenvolvedor no **GitHub** (`https://github.com/luckhaosbb`).
  - Link direto para o perfil profissional no **LinkedIn** (`https://www.linkedin.com/in/lucas-gomes-ab49582bb`).
  - Link direto para contato via **WhatsApp** (`https://wa.me/5585997893548`).
  - Informações de créditos acadêmicos e dados da NASA Exoplanet Archive.

---

## 7. Arquitetura do Sistema e Estrutura de Pastas

```
Daily Exoplanets/
├── DOCUMENTO_DE_VISAO.md            # Documento de visão do produto
├── FSD.md                           # Especificação funcional detalhada (FSD)
├── server/                          # Backend Node.js / Express
│   ├── db.js                        # Conexão PostgreSQL com fallback local
│   ├── server.js                    # Endpoints /api/today, /api/save-banner, /api/stats
│   └── data/                        # Acervo e banco local persistente
├── src/
│   ├── components/
│   │   ├── planetRenderer.js        # Motor 3D responsivo com giro tangível e inércia
│   │   ├── comicBannerGenerator.js  # Gerador procedural A4 sem caixas, com chave NFT e títulos únicos
│   │   ├── nasaApi.js               # Conexão com NASA TAP API
│   │   └── soundEffects.js          # Sistema de áudio sintetizado Web Audio API
│   ├── data/
│   │   └── exoplanets.js            # Acervo com títulos temáticos comic e orientações A4
│   ├── style.css                    # Estilização sci-fi terminal CRT e preview A4
│   └── main.js                      # Orquestrador da aplicação, contagem e eventos
├── index.html                       # Página única limpa e imersiva
├── package.json                     # Scripts dev e dependências
└── vite.config.js                   # Configuração e proxy
```
