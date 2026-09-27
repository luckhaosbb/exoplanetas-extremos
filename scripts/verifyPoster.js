import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cryptoService } from '../server/services/cryptoService.js';

function parsePngTextChunks(buffer) {
  // Verifica cabeçalho PNG (8 bytes)
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.subarray(0, 8).compare(pngSignature) !== 0) {
    throw new Error('O arquivo fornecido não é um arquivo PNG válido.');
  }

  const chunks = {};
  let offset = 8;

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) break;

    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const dataOffset = offset + 8;
    const dataEnd = dataOffset + length;

    if (type === 'tEXt' && dataEnd <= buffer.length) {
      const chunkData = buffer.subarray(dataOffset, dataEnd);
      const nullIdx = chunkData.indexOf(0x00);
      if (nullIdx !== -1) {
        const keyword = chunkData.subarray(0, nullIdx).toString('latin1');
        const text = chunkData.subarray(nullIdx + 1).toString('latin1');
        chunks[keyword] = text;
      }
    }

    if (type === 'IEND') break;
    offset = dataEnd + 4; // Pula dados + 4 bytes CRC
  }

  return chunks;
}

export function verifyPosterFile(filePath) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Arquivo não encontrado: ${resolvedPath}`);
    return;
  }

  console.log(`\n============================================================`);
  console.log(`🔍 AUDITORIA CRIPTOGRÁFICA DE PÔSTER • EXOPLANETAS EXTREMOS`);
  console.log(`📄 Arquivo: ${path.basename(resolvedPath)}`);
  console.log(`============================================================\n`);

  const buffer = fs.readFileSync(resolvedPath);
  const metadata = parsePngTextChunks(buffer);

  if (Object.keys(metadata).length === 0) {
    console.warn(`⚠️ Nenhum metadado criptográfico 'tEXt' encontrado neste arquivo PNG.`);
    console.warn(`Certifique-se de que este pôster foi exportado pelo motor oficial da coleção.`);
    return;
  }

  console.log(`📜 METADADOS BINÁRIOS EXTRAÍDOS DO ARQUIVO:`);
  console.table(metadata);

  // Validação da assinatura HMAC-SHA256 se os campos estiverem presentes
  if (metadata.Exoplanet_ID && metadata.Serial_Entropy && metadata.HMAC_Signature) {
    console.log(`\n🔐 AUDITANDO ASSINATURA HMAC-SHA256 COM O SERVIDOR...`);
    
    // Tenta primeiro a data oficial embutida no Token ID (ex: TOKEN#EXO-20260928-...)
    let targetDate = metadata.Drop_Date;
    const tokenDateMatch = (metadata.NFT_Token_ID || '').match(/TOKEN#EXO-(\d{4})(\d{2})(\d{2})-/i);
    if (tokenDateMatch) {
      targetDate = `${tokenDateMatch[1]}-${tokenDateMatch[2]}-${tokenDateMatch[3]}`;
    }

    // Extrai número de tiragem e titular
    const mintNumFromToken = (metadata.NFT_Token_ID || '').match(/TOKEN#EXO-\d{8}-(\d{4})-/i);
    const mintNumber = metadata.Mint_Number 
      ? parseInt(metadata.Mint_Number.replace(/\D/g, ''), 10) 
      : (mintNumFromToken ? parseInt(mintNumFromToken[1], 10) : null);
    
    const collectorName = metadata.Collector_Name || null;

    let validation = cryptoService.verifyCertificate({
      planetId: metadata.Exoplanet_ID,
      dateStr: targetDate,
      mintNumber,
      collectorName,
      serial: metadata.Serial_Entropy,
      signature: metadata.HMAC_Signature
    });

    // Fallback caso Drop_Date seja diferente
    if (!validation.valid && metadata.Drop_Date && metadata.Drop_Date !== targetDate) {
      validation = cryptoService.verifyCertificate({
        planetId: metadata.Exoplanet_ID,
        dateStr: metadata.Drop_Date,
        mintNumber,
        collectorName,
        serial: metadata.Serial_Entropy,
        signature: metadata.HMAC_Signature
      });
    }

    if (validation.valid) {
      console.log(`\n${validation.message}`);
      console.log(`────────────────────────────────────────────────────────────`);
      console.log(`🪐 Exoplaneta:           ${metadata.Exoplanet_Name || metadata.Exoplanet_ID}`);
      console.log(`🎖️ Exemplar de Tiragem:  ${validation.mintLabel || (mintNumber ? `EDIÇÃO #${String(mintNumber).padStart(4, '0')}` : 'OFICIAL')}`);
      console.log(`👑 Titular / Colecionador: ${validation.collectorName || collectorName || 'Colecionador Oficial'}`);
      console.log(`📅 Data do Drop:         ${validation.dateStr || targetDate}`);
      console.log(`🔑 Token ID:             ${metadata.NFT_Token_ID || 'N/A'}`);
      console.log(`🏛️ Autenticidade:        100% GENUÍNO E CERTIFICADO PELO OBSERVATÓRIO.`);
      console.log(`────────────────────────────────────────────────────────────\n`);
    } else {
      console.log(`\n⚠️ RESULTADO: ${validation.message}\n`);
    }
  } else {
    console.log(`\nℹ️ Pôster possui metadados locais: Token ${metadata.NFT_Token_ID || 'N/A'}`);
  }
}

// Execução via linha de comando
const targetFile = process.argv[2];
if (targetFile) {
  verifyPosterFile(targetFile);
}
