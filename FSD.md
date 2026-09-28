# 📄 FSD: ESPECIFICAÇÃO FUNCIONAL DO PROJETO (FUNCTIONAL SPECIFICATION DOCUMENT)
## EXOPLANETAS EXTREMOS - DROP DIÁRIO & CRIPTOGRAFIA DE AUTENTICIDADE

> 🌐 **Plataforma Oficial em Produção:** **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**

---

### 1. Objetivo e Escopo
Este documento detalha o funcionamento funcional, as regras de negócio, o layout visual e a arquitetura técnica da aplicação **Exoplanetas Extremos** (disponível publicamente em **[https://exoplanets.luckhaosbb.dev](https://exoplanets.luckhaosbb.dev/)**), com ênfase na experiência visual do visualizador 3D, no novo layout limpo e autoral do Pôster Comic A4, e no protocolo de **Chave Criptográfica Invisível em Metadados Binários PNG (NFT-like Provenance)** para garantir a autenticidade dos downloads diários sem poluir a arte gráfica.

---

### 2. Especificação do Visualizador 3D (Monitor Retrô CRT)

#### 2.1. Problema Identificado
O planeta possuía estética de scanlines aprovada, porém a esfera carecia de pontos de referência e iluminação tridimensional angular, dificultando a percepção da rotação (giro) quando o usuário arrasta o mouse ou desliza o dedo.

#### 2.2. Solução Implementada
1. **Sensação Tátil de Giro 3D:**
   - Adição de marcas de relevo esférico (faixas equatoriais, meridianos e vórtices/tempestades atmosféricas, como o "Grande Vórtice de Silicato") que se movem com projeção senoidal 3D ($X' = R \cdot \sin(\theta)$).
   - Quando o planeta gira, os detalhes emergem da borda escura da noite, cruzam a face iluminada e desaparecem no horizonte oposto, criando uma percepção imediata de profundidade e rotação tridimensional.
2. **Sensibilidade e Inércia do Giro:**
   - Multiplicador de sensibilidade de arraste elevado e responsivo 1:1.
   - Aplicação de inércia física (momento angular amortecido), permitindo que o usuário dê um "empurrão" no planeta e ele continue girando de forma realista.
   - Suporte nativo a touch e mouse com cursor dinâmico `grab`/`grabbing`.

---

### 3. Especificação do Pôster/Banner Comic A4 (Redefinição Visual Limpa)

#### 3.1. Elementos Removidos (Arte 100% Desobstruída)
- ❌ **Retângulo Vermelho Superior:** O banner de título genérico "GALAXY OF HORRORS" e o texto "NASA EXTRATERRESTRIAL THREAT DOSSIER" foram **completamente eliminados**.
- ❌ **Retângulo Preto Inferior:** O rodapé preto com código de barras, textos institucionais e faixas foi **completamente eliminado**.
- ❌ **Retângulo de Especificações:** O card com os números científicos (threat score, temperatura, massa, sobrevivência) foi **eliminado da arte do pôster**.
- ❌ **Preço 25¢:** O valor em centavos foi removido do selo de edição.
- ❌ **Caixas Inferiores de Texto:** O nome do planeta, subtítulo e o texto visual do token foram **completamente retirados do desenho**, deixando o pôster imersivo, limpo e sem poluição visual.

#### 3.2. Elementos Visuais Mantidos
- ✅ **Selo "Approved by Cosmic Archive Authority":** Mantido com moldura vintage no canto superior direito.
- ✅ **Badge "ISSUE #01 - EXTREME WORLDS DAILY":** Mantido no canto superior esquerdo, sem o preço "25¢".
- ✅ **Título Único e Temático do Planeta:** Cada planeta recebe um título dramático e temático integrado à ilustração (ex: *"THE RAZOR RAIN HORROR"*, *"THE IRON DELUGE"*, *"THE DEVOURING OVAL"*).
- ✅ **Ilustração Central em Destaque:** O exoplaneta ocupa o espaço com máxima dramaticidade visual, raios de ação cósmicos, retículas Ben-Day e vinheta vintage.

---

### 4. Protocolo de Tiragem Numerada & Certificação Criptográfica (Numbered Collector Mintage)

#### 4.1. Conceito: Tiragem Democrática com Posse Individualizada
Ao invés de adotar artificialidades como escassez restritiva (onde apenas 1 pessoa baixa e o site trava) ou degradar imagens públicas com marcas d'água e baixa resolução, o sistema emprega o conceito de **Litografia Digital / Gravura Clássica de Colecionador**:
1. **Arte Universal & Impecável:** Todo visitante acessa o pôster em resolução máxima (A4 300 DPI, sem marcas d'água, sem compressão destrutiva).
2. **Exemplar Oficial Numerado:** Cada download aciona a emissão atômica do próximo exemplar da tiragem daquele drop (`#0001`, `#0002`, `#0042`...).
3. **Titularidade Registrada:** O visitante pode informar seu nome/codinome no modal de emissão (ex: *"Lucas Gomes"* ou *"Comandante Silva"*), assinando sua posse no arquivo de forma permanente.
4. **Assinatura HMAC-SHA256:** O servidor computa a assinatura com sua chave mestre secreta sobre a tupla `(Exoplaneta + Data + Número de Série + Nome do Titular + Entropia)`.

#### 4.2. Especificação Técnica: Injeção de Chunks PNG `tEXt`
O gerador intercepta o fluxo de bytes do PNG e, antes do encerramento com o chunk `IEND`, injeta os blocos binários oficiais com verificação de integridade CRC32:

| Chave de Metadado (`Keyword`) | Valor Injetado no Arquivo PNG |
| :--- | :--- |
| `Exoplanet_ID` | Identificador único do planeta (ex: `hd-189733b`) |
| `Exoplanet_Name` | Nome astronômico oficial (ex: `HD 189733b`) |
| `Title` | Título temático da capa estilo gibi (ex: `THE RAZOR RAIN HORROR`) |
| `Subtitle` | Subtítulo atmosférico (ex: `Onde o Vidro Chove de Lado`) |
| `Drop_Date` | Data oficial do drop (`YYYY-MM-DD`) |
| `Mint_Number` | Número do exemplar na tiragem (ex: `EDIÇÃO #0001`) |
| `Collector_Name` | Nome ou codinome registrado do titular |
| `NFT_Token_ID` | Token de identificação único (`TOKEN#EXO-YYYYMMDD-0001-XXXX`) |
| `HMAC_Signature` | Assinatura HMAC-SHA256 gerada pelo servidor (`SHA256:...`) |
| `Serial_Entropy` | Entropia aleatória de 8 caracteres para proteção contra colisões |
| `Authenticity` | `Certified Original Daily Drop - Exoplanetas Extremos` |
| `Verification_Endpoint` | `/api/verify-token` |
| `Developer` | `Lucas Gomes (github.com/luckhaosbb)` |
| `Timestamp` | Carimbo ISO 8601 exato de emissão |

#### 4.3. Arte Visual Pura e Inviolável
Ao contrário de modelos tradicionais que estampam marcas d'água visíveis ou carimbos de série sobre a arte, o motor preserva a ilustração 100% limpa, autoral e cinematográfica. Nenhuma coordenada, código hash ou texto de série é pintado no canvas. Toda a prova matemática de procedência e posse reside com exclusividade dentro dos blocos binários oficiais do PNG.

#### 4.4. Auditoria de Posse & Verificação de Autenticidade
Qualquer pessoa em posse do arquivo ou de seu identificador pode auditá-lo:
- **Via Interface Web (Aba Pôster):**
  - **Drag-and-Drop Instantâneo:** O usuário solta o arquivo PNG na área de drop da página do pôster. O navegador executa a leitura direta dos bytes com `ArrayBuffer`, parseia os blocos `tEXt` em menos de 10ms (sem realizar upload do arquivo pesado) e envia apenas o payload criptográfico para `POST /api/verify-token`.
  - **Consulta por Token ID:** Permite ao usuário colar seu código alfanumérico único para auditoria direta.
  - **Painel Holográfico de Verificação:** Apresenta o resultado com feedback sonoro (`scanBeep` ou `hazardAlert`), certificando o exemplar oficial, titular registrado, data do drop e assinatura HMAC-SHA256 validada contra o observatório.
- **Via Linha de Comando (CLI):** `npm run verify-poster <caminho-do-arquivo.png>`
- **Via Endpoint HTTP Direto:** `POST https://exoplanets.luckhaosbb.dev/api/verify-token` (ou localmente `/api/verify-token`) com os parâmetros do certificado ou `tokenId`.
- Se alguém tentar alterar o nome do titular dentro dos metadados ou adulterar a imagem, a assinatura matemática SHA-256 é invalidada e o validador reprova o arquivo imediatamente com `❌ CERTIFICADO INVÁLIDO OU ADULTERADO`.

#### 4.5. Proteção de Infraestrutura & Concorrência Atômica
- O processamento de renderização 300 DPI consome 0% de CPU do servidor (roda inteiramente no cliente via Canvas 2D).
- O banco de dados consome menos de 120 bytes por exemplar emitido.
- A alocação de numeração é estritamente atômica e serializada (com lock por planeta e data), eliminando qualquer colisão mesmo se dezenas de usuários clicarem no exato mesmo milissegundo.
- O backend limita emissões a no máximo 5 exemplares por IP por hora. Se o mesmo titular baixar novamente o mesmo planeta no mesmo dia, o sistema devolve o mesmo exemplar já emitido (`reissued: true`) sem inflacionar a numeração.
- O banco de dados consome menos de 120 bytes por exemplar emitido.
- Para prevenir esgotamento de seriais por scripts ou robôs, o backend limita as emissões a no máximo 5 exemplares por IP por hora. Se o mesmo titular baixar novamente o mesmo planeta no mesmo dia, o sistema devolve o mesmo exemplar já emitido (`reissued: true`) sem inflacionar a numeração.

---

### 5. Arquitetura de Automação: Ciclo Semanal & Motor de IA Google Imagen 3

#### 5.1. O Ciclo Semanal Estruturado (Segunda a Domingo)
1. **Semanas Fechadas:** O sistema organiza as publicações em blocos semanais de 7 dias (Segunda-feira a Domingo).
2. **O Disparo de Sábado (00:00):** 
   - Faltando apenas o drop de Domingo para encerrar a semana corrente, o agendador em background (`cronService`) trava a grade da **Próxima Semana completa (Segunda a Domingo)** no banco de dados.
   - O domingo roda o último drop da semana atual; na segunda-feira 00:00, o novo bloco já está pronto para estreia sem risco de atrasos ou sobrecarga de requisições.

#### 5.2. Motor de IA em Cascata (Cascade Fallback Chain - Alta Disponibilidade)
1. **Redundância em 4 Níveis (Zero Falhas):**
   - **Rota 1 (Principal):** SiliconFlow (`black-forest-labs/FLUX.1-schnell`), gerando em ~2 segundos sem marcas d'água via GPU cluster.
   - **Rota 2 (Alta Performance Gratuita):** Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`), 10.000 Neurons gratuitos/dia na rede Edge global da Cloudflare.
   - **Rota 3 (Secundária):** Hugging Face Serverless API (`black-forest-labs/FLUX.1-schnell` via `HF_TOKEN`).
   - **Rota 4 (Rede de Segurança Infalível):** Pollinations.ai (Flux), 100% gratuito, sem cadastro, sem chave de API e sempre ativo.
2. **Fila Sequencial & Prevenção de Falhas:**
   - O agendador processa a fila sequencialmente. Caso qualquer rota externa responda com erro de saldo (`402`), rate limit (`429`) ou queda de serviço, o sistema comuta instantaneamente para a próxima rota sem interromper a execução do sábado.
3. **Especificação Técnica Completa:** Consulte o documento [ARCHITECTURE_AI_PIPELINE.md](file:///C:/Users/Lucas/Downloads/Daily%20Exoplanets/ARCHITECTURE_AI_PIPELINE.md).

#### 5.3. Banco de Dados Incremental (Sem dependência de 364 planetas no D0)
- O banco de dados cresce de forma sustentável e orgânica em lotes de **7 exoplanetas por semana**.
- Não há necessidade de cadastrar 364 exoplanetas previamente: a cada sábado, os próximos 7 planetas são agendados e salvos com suas respectivas fichas e chaves criptográficas.

---

### 6. Diretriz Oficial de Prompts & Engenharia Anti-Borda (Padrão 100% Full-Bleed)

#### 6.1. Diagnóstico do Problema das Bordas
Quando geradores de imagem (Midjourney, DALL-E, Imagen, Flux) recebem termos como `"comic book cover"`, o modelo deduz que deve renderizar a página física escaneada de uma revista dos anos 70. O resultado indesejado inclui:
- Margens largas de papel amarelado/envelhecido ao redor do quadro;
- Linhas pretas de moldura delimitando o desenho interno;
- Encolhimento do desenho útil, impedindo o preenchimento total do pôster A4.

#### 6.2. Solução Técnica Implementada
1. Substituição do termo `"comic book cover"` por `"Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic"`.
2. Especificação explícita de sangria total: `"The illustration completely fills 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting"`.
3. Inclusão de cláusulas restritivas negativas estritas: `"Completely borderless, full bleed, seamless canvas edges, no borders, no margins, no outer frame, no framing box, no panel borders around the canvas, no paper border trim, no white borders"`.

#### 6.3. Template Mestre Universal para Novos Exoplanetas
- **Proporção Vertical (Padrão):** Aspect Ratio `2:3`
- **Proporção Horizontal:** Aspect Ratio `3:2`

```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, [ELEMENTOS_ATMOSFERICOS_DO_PLANETA], and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "[TITULO_EM_INGLES]". The typography features [ESTILO_DA_TIPOGRAFIA: ex: blazing molten gold / brutal molten iron / jagged shattered silicate glass] letterforms with deep 3D block drop shadow and vibrant retro pulp gradient. Below the title, the exoplanet [NOME_DO_PLANETA] dominates the composition [DESCRICAO_DO_PLANETA_E_PERIGO_EXTREMO]. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

#### 6.4. Prompts Oficiais Homologados da Coleção

* **Issue #001: HD 189733b – "THE RAZOR RAIN HORROR" (Horizontal 3:2):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, cobalt-blue storm clouds, planetary atmospheric vortex, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE RAZOR RAIN HORROR". The typography features jagged, razor-sharp shattered silicate glass letterforms with dynamic explosive perspective, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from bright cadmium yellow at the top to fiery vermilion red at the bottom. Below the title, the deep cobalt-blue exoplanet HD 189733b dominates the composition, caught in a cataclysmic tempest, with monstrous horizontal supersonic winds at Mach 7 whipping thousands of glowing, razor-sharp shards of molten liquid glass horizontally across the planetary surface and bleeding off the edges of the canvas. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #002: KELT-9b – "THE STELLAR FURNACE" (Vertical 2:3):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, nebulae, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE STELLAR FURNACE". The typography features blazing molten gold and blinding solar fire letterforms with deep 3D block drop shadow and retro pulp gradient from bright solar yellow to incandescent orange-red. Below the title, the ultra-hot exoplanet KELT-9b dominates the composition, glowing violently with blazing solar furnace heat at 4300 degrees Celsius, orbiting dangerously close to a blinding blue-white star, with a monstrous comet tail of vaporized iron and titanium plasma streaming into deep space. Dynamic Jack Kirby cosmic energy krackle dots, swirling planetary atmospheric bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #003: WASP-76b – "THE IRON DELUGE" (Vertical 2:3):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, stormy metallic atmospheric clouds, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE IRON DELUGE". The typography features heavy, brutal molten iron letterforms with jagged glowing dripping edges, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from bright molten yellow to fiery iron-red. Below the title, the tidally locked exoplanet WASP-76b dominates the composition with a dramatic terminator line: the blistering copper dayside contrasts against the dark nightside where an apocalyptic, torrential deluge of incandescent liquid molten iron raindrops falls through dark metallic storm clouds and surreal alien landscape below. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #004: TrES-2b – "THE LIGHTLESS VOID" (Vertical 2:3):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, eerie deep space nebula, shadowy cosmic dust, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE LIGHTLESS VOID". The typography features abyssal obsidian and smoking charcoal letterforms with faint crimson glowing ember cracks and edges, heavy black India ink outlines, deep 3D block drop shadow, and a sinister retro pulp gradient from dark fiery blood-red to pitch void black. Below the title, the pitch-black exoplanet TrES-2b dominates the composition, darker than coal and absorbing 99% of all light, a monstrous light-devouring sphere looming menacingly against the stars, faintly glowing with eerie deep infrared thermal red embers radiating from its mysterious ultra-hot atmosphere of vaporized sodium and titanium oxide. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #005: WASP-12b – "THE DEVOURING OVAL" (Horizontal 3:2):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, blazing solar corona filaments, superheated carbon gas ribbons, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE DEVOURING OVAL". The typography features tidal-stretched blazing solar plasma and molten amber letterforms with explosive solar flare accents, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from intense incandescent yellow at the top to fiery magma orange at the bottom. Below the title, the doomed exoplanet WASP-12b dominates the composition, violently distorted and stretched into an egg-like oval by titanic tidal gravitational forces, as a colossal nearby yellow dwarf star voraciously siphons and devours its glowing superheated atmosphere in massive swirling bridges of incandescent gas and plasma streaming across the cosmos and bleeding off the edges of the canvas. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #006: 55 Cancri e – "THE DIAMOND CRUCIBLE" (Vertical 2:3):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, shimmering crystalline dust, toxic cyan vapor plumes, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE DIAMOND CRUCIBLE". The typography features scintillating crystalline diamond and burning molten lava letterforms with razor-sharp gem-cut facets and dripping liquid magma edges, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from electric crystalline cyan-blue to fiery molten lava-red. Below the title, the super-Earth exoplanet 55 Cancri e dominates the composition, a hellish world of global boiling liquid magma oceans and fiery volcanic geysers spewing toxic cyan cyanide clouds, with titanic crust fissures revealing glowing compressed sparkling pure diamond crystals under extreme planetary pressure, bathed in the fierce glare of its nearby star. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #007: PSR B1257+12c – "THE PULSAR OF THE DEAD" (Vertical 2:3):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, ghostly glowing magnetic nebula filaments, lethal gamma radiation arcs, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE PULSAR OF THE DEAD". The typography features crackling radioactive neon-violet and electric cyan lightning letterforms with jagged ethereal ghost-like edges, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from brilliant electric cyan at the top to deep radioactive violet-purple at the bottom. Below the title, the eerie rocky exoplanet PSR B1257+12c dominates the composition, a ghost world condemned to orbit a rapidly spinning dead neutron star pulsar, swept by lethal relativistic lighthouse beams of gamma-ray radiation, intense magnetic shockwaves, and spectral neon auroras washing over its cratered desolate surface. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

* **Issue #008: GJ 1214b – "THE BOUNDLESS BOILING SEA" (Horizontal 3:2):**
```text
Full bleed, borderless cinematic science-fiction illustration in retro 1970s pulp graphic novel aesthetic. The dark starry space, dense sapphire steam clouds, glowing atmospheric vapor veils, and cosmic visuals fill 100% of the image from edge to edge, bleeding off all four sides with absolutely no borders, no margins, and no matting. At the top center, stylized hand-drawn title lettering seamlessly integrated into the art reading "THE BOUNDLESS BOILING SEA". The typography features surging ocean water and high-pressure boiling steam letterforms with churning wave crests and swirling vapor tendrils, heavy black India ink outlines, deep 3D block drop shadow, and a vibrant retro pulp gradient from luminous aquamarine-cyan at the top to deep oceanic abyssal blue at the bottom. Below the title, the mysterious water-world exoplanet GJ 1214b dominates the composition, a shoreless and bottomless oceanic super-Earth blanketed in thick sweltering steam mists and massive cyclonic clouds, where boiling supercritical water at 20000 atmospheres of crushing pressure churns under the eerie reddish glow of a dim red dwarf star and bleeds off all canvas edges. Dynamic Jack Kirby cosmic energy krackle dots, swirling atmospheric vortex bands, dramatic chiaroscuro lighting, bold ink linework, vibrant 1970s pulp science-fiction colors, visible four-color CMYK halftone dots. Completely borderless, full bleed, seamless canvas edges, no border, no white border, no paper border, no frame, no margin, no paper trim, no white edge, no picture frame, no page border, no comic page margins, no digital 3D CGI look, no logos, no barcode.
```

---

### 7. Painel de Curadoria Semanal do Autor

#### 7.1. Finalidade
Permite ao autor/curador inspecionar e auditar antecipadamente os 7 exoplanetas da próxima semana agendados no sábado, visualizar as artes integradas ao motor do pôster A4 em tempo real, baixar os arquivos finais e regenerar individualmente qualquer imagem com um clique através do Google Cloud Imagen 3.

#### 7.2. Funcionalidades da Curadoria
1. **Auditoria Visual:** Grade de 7 dias (Segunda a Domingo) com status de arte (`● Arte Pronta` ou `○ Aguardando`).
2. **Regeneração On-Demand (`POST /api/curadoria/regenerate`):** Permite disparar uma nova geração para um planeta específico caso a arte gerada na madrugada de sábado necessite de refinamento.
3. **Disparo Manual de Ciclo (`POST /api/curadoria/run-weekly-cycle`):** Permite adiantar ou reexecutar o agendamento da próxima semana a qualquer momento pelo botão *"⚡ Executar Ciclo da Próxima Semana"*.

#### 7.3. Arquitetura de Segurança da Curadoria (Cybersecurity Hardening)
- **Token Secreto HMAC-SHA256:** Acesso restrito via token criptográfico assinado com `SERVER_SECRET_KEY` emitido exclusivamente pelo script confidencial `scripts/curadoria.js`.
- **Proteção contra Path Traversal (CWE-22):** Validação estrita via Regex (`/^[a-zA-Z0-9_-]{2,64}$/`) para qualquer parâmetro `planetId` antes de leitura ou gravação de imagens em disco.
- **Proteção contra Information Disclosure (CWE-200):** Credenciais como `GOOGLE_GENAI_API_KEY` e `SERVER_SECRET_KEY` nunca são enviadas ao cliente ou expostas em payloads de erro.
- **Isolamento de Assets:** Acesso público bloqueado a planetas não publicados enquanto o site estiver em pré-estreia (`COMING_SOON=true`).
- **Comando de Abertura:** `npm run curadoria` (detecta servidor ativo ou sobe automaticamente e abre o navegador autenticado).

