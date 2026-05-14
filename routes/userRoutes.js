import express from 'express';
import multer from 'multer';
import { createAccount, login, logout, getUtilizador, updatePfp } from '../controllers/userController.js';

const router = express.Router();

// Rota para atualizar a imagem de perfil do utilizador
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/data/pfps/'),
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `${req.session.utilizador.nickname}.${ext}`);
    }
});

// Filtro para aceitar apenas imagens JPEG, PNG e WEBP
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
    fileFilter: (req, file, cb) => {
        const permitidos = ['image/jpeg', 'image/png', 'image/webp'];
        permitidos.includes(file.mimetype) ? cb(null, true) : cb(new Error('Formato inválido'));
    }
});

// Middleware para verificar se o utilizador está autenticado
function autenticado(req, res, next) {
    req.session.utilizador ? next() : res.redirect('/login');
}

// ============================== Rotas ==============================

router.post('/createAccount', createAccount);
router.post('/login', login);
router.post('/logout', autenticado, logout);
router.get('/utilizador', autenticado, getUtilizador);
router.post('/pfp', autenticado, upload.single('pfp'), updatePfp);

export default router;