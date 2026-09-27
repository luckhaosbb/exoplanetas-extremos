import { Router } from 'express';
import { planetController } from '../controllers/planetController.js';
import { cryptoController } from '../controllers/cryptoController.js';
import { subscriberController } from '../controllers/subscriberController.js';
import { authController } from '../controllers/authController.js';
import { requireCuratorAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Rotas de Autenticação do Curador / Observatório
router.post('/curadoria/login', authController.login);
router.get('/curadoria/verify', authController.verify);
router.post('/curadoria/logout', authController.logout);

// Rotas Públicas de Exoplanetas e Banners
router.get('/today', planetController.getToday);
router.get('/stats', planetController.getStats);

// Rota de Validação Criptográfica de Autenticidade (NFT-like)
router.post('/verify-token', cryptoController.verifyToken);

// Rotas de Emissão de Tiragem Numerada de Colecionador (Minting)
router.post('/mint-poster', cryptoController.mintPoster);
router.get('/mint-stats', cryptoController.getMintStats);

// Rota de Inscrição na Newsletter Diária (Estilo Tyler Vigen)
router.post('/subscribe', subscriberController.subscribe);

// Rotas Administrativas Protegidas (Exclusivas do Curador Autenticado)
router.get('/curadoria', requireCuratorAuth, planetController.getCuradoria);
router.post('/curadoria/regenerate', requireCuratorAuth, planetController.regenerateArtwork);
router.post('/curadoria/upload-artwork', requireCuratorAuth, planetController.uploadArtwork);
router.post('/curadoria/run-weekly-cycle', requireCuratorAuth, planetController.triggerWeeklyCycle);
router.post('/save-banner', requireCuratorAuth, planetController.saveBanner);
router.all('/reset-planets', requireCuratorAuth, planetController.resetPlanets);

export default router;
