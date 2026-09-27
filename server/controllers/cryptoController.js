import crypto from 'crypto';
import { cryptoService } from '../services/cryptoService.js';
import { mintRepository } from '../repositories/mintRepository.js';
import { planetService } from '../services/planetService.js';
import { config } from '../config/index.js';

/**
 * Controller responsável pela emissão de tiragens numeradas de colecionador
 * e validações criptográficas de autenticidade (HMAC-SHA256).
 */
export const cryptoController = {
  /**
   * POST /api/mint-poster
   * Emite um exemplar oficial numerado exclusivo para o visitante
   */
  async mintPoster(req, res) {
    try {
      const planetId = req.body.planetId || req.body.planet;
      const { collectorName, dateStr: customDate } = req.body;

      if (!planetId) {
        return res.status(400).json({
          success: false,
          error: 'O identificador do exoplaneta (planetId) é obrigatório.'
        });
      }

      // Identifica o IP de forma segura com salt criptográfico
      const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
      const ipHash = crypto
        .createHash('sha256')
        .update(rawIp + config.serverSecretKey)
        .digest('hex')
        .slice(0, 16);

      // Determina a data oficial do drop
      const dateStr = (customDate && /^\d{4}-\d{2}-\d{2}$/.test(customDate))
        ? customDate
        : planetService.getTodayDateString();

      const cleanCollector = (collectorName && typeof collectorName === 'string' && collectorName.trim().length > 0)
        ? collectorName.trim().slice(0, 50)
        : 'Colecionador Oficial';

      // Executa a alocação e gravação em bloco estritamente atômico e serializado
      const mintResult = await mintRepository.executeAtomicMint(planetId, dateStr, async () => {
        // 1. Prevenção de duplicidade: se o mesmo IP já emitiu recentemente com o mesmo nome para este drop
        const recentMints = await mintRepository.getRecentMintsByIp(planetId, dateStr, ipHash, 60);
        const existingSameName = recentMints.find(m => m.collector_name.toLowerCase() === cleanCollector.toLowerCase());

        if (existingSameName) {
          const cert = {
            tokenId: existingSameName.token_id,
            signature: existingSameName.signature,
            serial: existingSameName.serial_entropy,
            dateStr: existingSameName.date_str,
            mintNumber: existingSameName.mint_number,
            mintLabel: `EDIÇÃO #${String(existingSameName.mint_number).padStart(4, '0')}`,
            collectorName: existingSameName.collector_name,
            issuedAt: existingSameName.created_at,
            issuer: 'NASA Cosmic Archive Protocol • Lucas Gomes'
          };

          return {
            statusCode: 200,
            payload: {
              success: true,
              reissued: true,
              certificate: cert,
              mintNumber: existingSameName.mint_number,
              mintLabel: cert.mintLabel,
              collectorName: existingSameName.collector_name,
              tokenId: cert.tokenId,
              message: 'Seu exemplar oficial já havia sido emitido. O arquivo original foi recuperado com sucesso!'
            }
          };
        }

        // 2. Proteção contra bots / esgotamento de seriais (máx 5 emissões por IP por hora)
        if (recentMints.length >= 5) {
          return {
            statusCode: 429,
            payload: {
              success: false,
              error: 'Limite de emissões por hora atingido para este dispositivo. Baixe os exemplares já emitidos ou tente novamente mais tarde.'
            }
          };
        }

        // 3. Obtém o próximo número atômico sequencial da tiragem (sem risco de colisão)
        const mintNumber = await mintRepository.getNextMintNumber(planetId, dateStr);

        // 4. Assina criptograficamente com HMAC-SHA256
        const certificate = cryptoService.generateCertificate({
          planetId,
          dateStr,
          mintNumber,
          collectorName: cleanCollector
        });

        // 5. Persiste o registro oficial de posse no repositório
        await mintRepository.saveMint({
          planetId,
          dateStr,
          mintNumber,
          collectorName: cleanCollector,
          tokenId: certificate.tokenId,
          signature: certificate.signature,
          serialEntropy: certificate.serial,
          ipHash
        });

        console.log(`🪙 [MINT ATÔMICO] Emitido Exemplar #${String(mintNumber).padStart(4, '0')} para "${cleanCollector}" (${planetId})`);

        return {
          statusCode: 200,
          payload: {
            success: true,
            reissued: false,
            certificate,
            mintNumber,
            mintLabel: certificate.mintLabel,
            collectorName: cleanCollector,
            tokenId: certificate.tokenId
          }
        };
      });

      return res.status(mintResult.statusCode).json(mintResult.payload);
    } catch (error) {
      console.error('❌ [CRYPTO CONTROLLER] Erro ao emitir exemplar oficial:', error);
      return res.status(500).json({
        success: false,
        error: 'Falha interna ao emitir o exemplar oficial numerado.'
      });
    }
  },

  /**
   * GET /api/mint-stats
   * Retorna estatísticas de tiragem do drop (quantos emitidos e próximo número)
   */
  async getMintStats(req, res) {
    try {
      const planetId = req.query.planetId || req.query.planet;
      const customDate = req.query.dateStr;
      if (!planetId) {
        return res.status(400).json({ success: false, error: 'planetId obrigatório.' });
      }

      const dateStr = (customDate && /^\d{4}-\d{2}-\d{2}$/.test(customDate))
        ? customDate
        : planetService.getTodayDateString();

      const stats = await mintRepository.getStats(planetId, dateStr);
      return res.json({
        success: true,
        planetId,
        dateStr,
        ...stats,
        formattedNextMint: `#${String(stats.nextMintNumber).padStart(4, '0')}`
      });
    } catch (error) {
      console.error('❌ [CRYPTO CONTROLLER] Erro ao consultar estatísticas de tiragem:', error);
      return res.status(500).json({
        success: false,
        error: 'Falha interna ao consultar estatísticas de tiragem.'
      });
    }
  },

  /**
   * POST /api/verify-token
   * Valida se um token de autenticidade é genuíno
   */
  async verifyToken(req, res) {
    try {
      let { planetId, dateStr, mintNumber, collectorName, serial, signature, tokenId } = req.body;

      // Se passou apenas o tokenId (ou faltam parâmetros), busca no repositório
      if (tokenId && (!planetId || !dateStr || !serial || !signature)) {
        const record = await mintRepository.getMintByToken(tokenId);
        if (!record) {
          return res.status(404).json({
            valid: false,
            error: 'Exemplar oficial com este Token ID não foi encontrado no registro.'
          });
        }
        planetId = record.planet_id;
        dateStr = record.date_str;
        mintNumber = record.mint_number;
        collectorName = record.collector_name;
        serial = record.serial_entropy;
        signature = record.signature;
      }

      if (!planetId || !dateStr || !serial || !signature) {
        return res.status(400).json({
          valid: false,
          error: 'Parâmetros incompletos para validação. Forneça o tokenId ou os campos completos do certificado.'
        });
      }

      const result = cryptoService.verifyCertificate({
        planetId,
        dateStr,
        mintNumber,
        collectorName,
        serial,
        signature
      });

      return res.json({
        ...result,
        tokenId: tokenId || `TOKEN#EXO-${dateStr.replace(/-/g, '')}-${String(mintNumber || 1).padStart(4, '0')}-${serial ? serial.slice(0, 4) : 'XXXX'}`,
        collectorName,
        mintNumber,
        planetId,
        dateStr
      });
    } catch (error) {
      console.error('❌ [CRYPTO CONTROLLER] Erro ao validar assinatura:', error);
      return res.status(500).json({
        valid: false,
        error: 'Falha interna ao validar o certificado.'
      });
    }
  }
};
