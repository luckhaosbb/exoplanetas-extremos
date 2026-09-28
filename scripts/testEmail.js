import { emailService } from '../server/services/emailService.js';
import { config } from '../server/config/index.js';

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.log('\n❌ Uso correto:');
  console.log('  node scripts/testEmail.js <seu-email@dominio.com>\n');
  process.exit(1);
}

console.log('\n============================================================');
console.log('🛰️ TESTE DE DISPARO DE E-MAIL • OBSERVATÓRIO DE EXOPLANETAS');
console.log('============================================================');
console.log(`📧 Destinatário:      ${targetEmail}`);
console.log(`📤 Remetente (FROM):   ${config.emailFrom}`);
console.log(`🔑 Resend Ativo?      ${emailService.isConfigured() ? '✅ SIM (API Key detectada)' : '❌ NÃO (Falta RESEND_API_KEY no .env)'}`);
console.log('============================================================\n');

if (!emailService.isConfigured()) {
  console.error('⚠️ Atenção: Para testar o envio real, você precisa adicionar sua chave no .env:');
  console.error('   RESEND_API_KEY=re_sua_chave_aqui\n');
  process.exit(1);
}

console.log('Enviando e-mail de boas-vindas transacional...');
const result = await emailService.sendWelcomeEmail(targetEmail);

if (result.success) {
  console.log(`\n🎉 E-MAIL DISPARADO COM SUCESSO!`);
  console.log(`ID do Envio Resend: ${result.id}`);
  console.log(`Verifique a Caixa Principal de ${targetEmail}.\n`);
} else {
  console.error(`\n❌ Falha no disparo:`, result.error);
}
