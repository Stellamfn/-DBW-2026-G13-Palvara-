import express from 'express';
import { criarSala, entrarSala, listarSalas, getSala } from '../controllers/roomController.js';

const router = express.Router();

function autenticado(req, res, next) {
    req.session.utilizador ? next() : res.redirect('/login');
}

router.post('/criar', autenticado, criarSala);
router.post('/entrar', autenticado, entrarSala);
router.get('/listar', autenticado, listarSalas);
router.get('/:codigo', autenticado, getSala);

export default router;