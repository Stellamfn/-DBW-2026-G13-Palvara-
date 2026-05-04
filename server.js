// ======================================================================
// IMPORTANTE: ESTE FICHEIRO É PARA FICAR NO DIRETÓRIO RAIZ DO PROJETO
// ======================================================================

import dotenv from 'dotenv'; // Para ler as variáveis de ambiente do ficheiro .env
dotenv.config(); // Carrega as variáveis de ambiente do ficheiro .env para process.env
//console.log(process.env.MONGO_URI); // Verifica se a variável de ambiente MONGO_URI foi carregada corretamente

import express from 'express'; // Para criar o servidor e definir as rotas
import mongoose from 'mongoose'; // Para ligar ao MongoDB
import session from 'express-session'; // Para gerir sessões de utilizadores
import sanitizeHtml from 'sanitize-html'; // Não permite injeção de html a partir dos formulários
import User from './models/user.js'; // Importa o modelo de utilizador
import bcrypt from 'bcrypt'; // Para encriptar as palavras-passe
import multer from 'multer'; // Para lidar com uploads de ficheiros (imagens de perfil)
import fs from 'fs'; // Para lidar com o sistema de ficheiros (apagar pfps antigas)
import path from 'path'; // Para lidar com caminhos de ficheiros (construir caminho para pfps)

// ======================================================================

// Define express como a app que iremos usar
const app = express();
// Porta do servidor
const PORT = 3000;

// Liga ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB ligado'))
    .catch(err => console.error('Erro ao ligar ao MongoDB:', err));

// Serve os ficheiros estáticos (css, js, imagens, etc.)
app.use(express.static('public'));

// Middleware para ler o corpo das requisições em formato JSON
app.use(express.json());

// Configura a sessão para autenticação de utilizadores
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // true apenas com HTTPS
}));

// ============================== API ==============================
import userRoutes from './routes/userRoutes.js';

app.use('/api', userRoutes);

// ============================== Views ==============================
function autenticado(req, res, next) {
    req.session.utilizador ? next() : res.redirect('/login');
}

app.get('/', autenticado, (req, res) => res.sendFile('index.html', { root: './views' }));
app.get('/singlePlayer', autenticado, (req, res) => res.sendFile('singlePlayer.html', { root: './views' }));
app.get('/multiPlayer', autenticado, (req, res) => res.sendFile('multiplayerPlayRoom.html', { root: './views' }));
app.get('/multiPlayer-waitRoom', autenticado, (req, res) => res.sendFile('multiplayerWaitRoom.html', { root: './views' }));
app.get('/sign-in', (req, res) => res.sendFile('createAccountPage.html', { root: './views' }));
app.get('/login', (req, res) => res.sendFile('loginPage.html', { root: './views' }));

// 0.0.0.0 permite ligações a dispositivos na mesma rede // Neste momento redundante
// 0.0.0.0/0 é para permitir ligações de qualquer IP (útil para testes em redes externas ou com VPNs)
app.listen(PORT, '0.0.0.0', '0.0.0.0/0', () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});

// ======================================================================

// Log de Erros

/* Ignorar "Unchecked runtime.lastError" - É erro do browser, não do projeto */

/*
// ============================== Rotas ============================== E isto !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Middleware para verificar se o utilizador está autenticado
function autenticado(req, res, next) {
    if (req.session.utilizador) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Rota para a página principal
app.get('/', autenticado, (req, res) => {
    res.sendFile('index.html', { root: './views' });
});

// Rota para a página de Single Player
app.get('/singlePlayer', autenticado,  (req, res) => {
    res.sendFile('singlePlayer.html', { root: './views' });
});

// Rota para a página de Multi Player
app.get('/multiPlayer', autenticado, (req, res) => {
    res.sendFile('multiplayerPlayRoom.html', { root: './views' });
});

// Rota para a página de Espera Multi Player
app.get('/multiPlayer-waitRoom', autenticado, (req, res) => {
    res.sendFile('multiplayerWaitRoom.html', { root: './views' });
});

// Rota para a página de Criar Conta
app.get('/sign-in', (req, res) => {
    res.sendFile('createAccountPage.html', { root: './views' });
});

// Rota para a página de Log-In
app.get('/login', (req, res) => {
    res.sendFile('loginPage.html', { root: './views' });
});

// ============================== API ==============================

// Rota para criar conta
app.post('/api/createAccount', async (req, res) => {
    const { nickname, password } = req.body; // Obtém o nickname e a palavra-passe do corpo da requisição

     // Sanitiza o nickname para evitar injeção de HTML
    const nicknameSanitizado = sanitizeHtml(nickname);

    try {
        const existente = await User.findOne({ nickname: nicknameSanitizado }); // Verifica se já existe um utilizador com o mesmo nickname (já sanitizado)
        if (existente) {
            return res.status(400).json({ erro: 'Nickname já existe' });
        }

        const passwordEncriptada = await bcrypt.hash(password, 10); // Encripta a palavra-passe com um salt de 10 rounds
        const novoUser = new User({ nickname: nicknameSanitizado, password: passwordEncriptada }); // Cria um novo utilizador com o nickname sanitizado e a palavra-passe encriptada
        await novoUser.save(); // Salva o novo utilizador na base de dados

        res.status(201).json({ mensagem: 'Conta criada com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar conta' });
    }
});

// Rota para login
app.post('/api/login', async (req, res) => {
    const { nickname, password } = req.body; // Obtém o nickname e a palavra-passe do corpo da requisição

    // Sanitiza o nickname para evitar injeção de HTML
    const nicknameSanitizado = sanitizeHtml(nickname);

    try {
        const utilizador = await User.findOne({ nickname: nicknameSanitizado }); // Procura o utilizador com o nickname fornecido (já sanitizado)
        if (!utilizador) {
            return res.status(401).json({ erro: 'Nickname ou palavra-passe incorretos' });
        }

        const passwordCorreta = await bcrypt.compare(password, utilizador.password); // Compara a palavra-passe fornecida com a palavra-passe encriptada armazenada na base de dados
        if (!passwordCorreta) {
            return res.status(401).json({ erro: 'Nickname ou palavra-passe incorretos' });
        }

        req.session.utilizador = utilizador;
        res.status(200).json({ mensagem: 'Login bem sucedido' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao fazer login' });
    }
});

// Rota para logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Rota para obter os dados do utilizador autenticado
app.get('/api/utilizador', autenticado, (req, res) => {
    res.json(req.session.utilizador);
});

// Rota para atualizar a imagem de perfil do utilizador

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/data/pfps/');
    },
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
        const extensoesPermitidas = ['image/jpeg', 'image/png', 'image/webp'];
        if (extensoesPermitidas.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato inválido. Usa JPG, PNG ou WEBP'));
        }
    }
});

// Rota para atualizar a imagem de perfil do utilizador
app.post('/api/pfp', autenticado, upload.single('pfp'), async (req, res) => {
    const utilizadorAtual = req.session.utilizador;
    
    // Apaga a pfp antiga se não for a default
    if (utilizadorAtual.pfp && utilizadorAtual.pfp !== '/img/pfpDefault.png') {
        const caminhoAntigo = path.join('public', utilizadorAtual.pfp);
        if (fs.existsSync(caminhoAntigo)) {
            fs.unlinkSync(caminhoAntigo);
        }
    }

    const caminho = `/data/pfps/${req.file.filename}`;
    await User.findByIdAndUpdate(utilizadorAtual._id, { pfp: caminho });
    req.session.utilizador.pfp = caminho;

    res.json({ pfp: caminho });
});

// ====================================================================== Entre isto !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
});*/