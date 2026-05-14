import express from 'express';
import { iniciarJogo, getPalavra, verificarPalavra, atualizarMetricas } from '../controllers/gameController.js';

const router = express.Router();

function autenticado(req, res, next) {
    req.session.utilizador ? next() : res.redirect('/login');
}

router.post('/iniciar', autenticado, iniciarJogo);
router.get('/palavra', autenticado, getPalavra);
router.post('/verificar', autenticado, verificarPalavra);
router.post('/metricas', autenticado, atualizarMetricas);

export default router;