# 📄 FSD: ESPECIFICAÇÃO FUNCIONAL DO PROJETO (FUNCTIONAL SPECIFICATION DOCUMENT)
## EXOPLANETAS EXTREMOS - DROP DIÁRIO & CRIPTOGRAFIA DE AUTENTICIDADE

---

### 1. Objetivo e Escopo
Este documento detalha o funcionamento funcional, as regras de negócio, o layout visual e a arquitetura técnica da aplicação **Exoplanetas Extremos**, com ênfase na experiência visual do visualizador 3D, no novo layout limpo e autoral do Pôster Comic A4, e no protocolo de **Chave Criptográfica Invisível em Metadados Binários PNG (NFT-like Provenance)** para garantir a autenticidade dos downloads diários sem poluir a arte gráfica.

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

### 4. Protocolo Criptográfico de Autenticidade (NFT-Like nos Metadados Binários PNG)

#### 4.1. Conceito: Por que nos Metadados e Não na Arte?
Imprimir códigos na arte visual desvaloriza a estética do pôster. Nos NFTs e certificados digitais autênticos, os dados de procedência ficam gravados na **estrutura binária do arquivo**.

#### 4.2. Especificação Técnica: Injeção de Chunks PNG `tEXt`
O formato PNG (especificação W3C / ISO/IEC 15948) permite blocos de metadados textuais chamados **`tEXt`**. 
O gerador intercepta o fluxo de bytes do PNG e, antes do encerramento com o chunk `IEND`, injeta os seguintes blocos binários oficiais com verificação de integridade CRC32:

| Chave de Metadado (`Keyword`) | Valor Injetado no Arquivo PNG |
| :--- | :--- |
| `Exoplanet_ID` | `hd-189733b` |
| `Exoplanet_Name` | `HD 189733b` |
| `Title` | `THE RAZOR RAIN HORROR` |
| `Subtitle` | `A Chuva Lateral de Vidro Líquido` |
| `Drop_Date` | Data oficial do drop (`YYYY-MM-DD`) |
| `NFT_Token_ID` | `TOKEN#EXO-XXXX-XXXX-XXXXXX` (Hash único gerado na data) |
| `Authenticity` | `Certified Original Daily Drop - Exoplanetas Extremos` |
| `Developer` | `Lucas Gomes (github.com/luckhaosbb)` |
| `Timestamp` | Carimbo de data/hora ISO 8601 exato da emissão |

#### 4.3. Como o Usuário Comprova a Autenticidade?
Ao baixar a imagem:
1. A arte visual é limpa e pura para uso como pôster de parede ou papel de parede.
2. Ao inspecionar os detalhes do arquivo no Windows (Propriedades > Detalhes), no Photoshop, via terminal (`strings arquivo.png`) ou em um leitor de metadados, o token e o certificado oficial da NASA/Exoplanetas Extremos estão permanentemente embutidos na imagem.

---

### 5. Comparativo e Análise: Opção 3 (Coleção Autoral) vs Opção 2 (IA no Backend)

#### 5.1. Como vai funcionar a Opção 3 (Coleção Ilustrada Autoral)?
1. **Curadoria Visual Prévia:** Cada um dos exoplanetas catalogados recebe uma ilustração conceitual mestre em alta definição (300 DPI) com estilo de traço comic autêntico (linhas pesadas, paleta retro e sombreamento noir).
2. **Camadas Dinâmicas:** O gerador do site carrega a ilustração de fundo do planeta correspondente e sobrepõe em tempo real:
   - A moldura vintage de gibi;
   - O selo *Approved by Cosmic Archive Authority*;
   - O badge *Issue #01 - Extreme Worlds Daily*;
   - O título exclusivo do dia com extrusão 3D e contorno de nanquim;
   - A injeção automática da chave NFT nos metadados binários do PNG no momento do download.
3. **Fluxo:** O download é instantâneo (menos de 150ms), roda no próprio navegador sem depender de servidores externos e a qualidade gráfica é 100% garantida e impecável.

#### 5.2. Análise de Qualidade de Imagem da Opção 2 (IA Generativa no Backend)
- **O que a IA entrega de bom:** Muita riqueza de detalhes em atmosferas caóticas e texturas de ficção científica dos anos 70.
- **Limitações Críticas de Qualidade na IA:**
  - *Resolução Nativa Insuficiente:* As APIs de IA (Midjourney, DALL-E, Flux) geram nativamente em 1024x1024 ou no máximo 1792x1024 pixels. Para um pôster A4 de impressão gráfica em 300 DPI (3508x2480 pixels), a imagem gerada por IA precisaria ser redimensionada por upscaling artificial, o que muitas vezes deixa as linhas borradas ou com ruído.
  - *Inconsistências no estilo Comic:* IAs frequentemente misturam estilos 3D hiper-realistas com pintura digital moderna, falhando em manter o rigoroso estilo de nanquim clássico vintage e cores chapadas da Marvel dos anos 70.
  - *Instabilidade de Rede e Custo:* Cada geração consome créditos de API e leva de 15 a 40 segundos, podendo falhar se a API estiver fora do ar.
- **Veredito:** A **Opção 3 é muito superior em fidelidade e qualidade de impressão**, pois garante que cada arte seja aprovada manualmente sem artefatos ou upscaling artificial, combinando a arte definitiva com a montagem programática e a criptografia NFT nos metadados.
