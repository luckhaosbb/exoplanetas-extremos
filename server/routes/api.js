import { Router } from 'express';
import { planetController } from '../controllers/planetController.js';
import { cryptoController } from '../controllers/cryptoController.js';
import { subscriberController } from '../controllers/subscriberController.js';

const router = Router();

// Rotas de Exoplanetas e Banners
router.get('/today', planetController.getToday);
router.post('/save-banner', planetController.saveBanner);
router.get('/stats', planetController.getStats);

// Rota de Validação Criptográfica de Autenticidade (NFT-like)
router.post('/verify-token', cryptoController.verifyToken);

// Rota de Inscrição na Newsletter Diária (Estilo Tyler Vigen)
router.post('/subscribe', subscriberController.subscribe);

// Rota de Reinicialização Segura do Catálogo
router.all('/reset-planets', planetController.resetPlanets);

export default router;
