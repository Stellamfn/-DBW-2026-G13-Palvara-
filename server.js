// ======================================================================
// IMPORTANTE: ESTE FICHEIRO É PARA FICAR NO DIRETÓRIO RAIZ DO PROJETO
// ======================================================================

import dotenv from 'dotenv';

dotenv.config();
//console.log(process.env.MONGO_URI);

import express from 'express';
import mongoose from 'mongoose';

//Não permite injeção de html a partir dos formulários
import sanitizeHtml from 'sanitize-html';

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

//Impporta o modelo de utilizador
import User from './models/user.js';

//Middleware para ler o corpo das requisições em formato JSON
app.use(express.json());

// ============================== Rotas ==============================

// Rota para a página principal
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './views' });
});

// Rota para a página de Single Player
app.get('/singlePlayer', (req, res) => {
    res.sendFile('singlePlayer.html', { root: './views' });
});

// Rota para a página de Multi Player
app.get('/multiPlayer', (req, res) => {
    res.sendFile('multiplayerPlayRoom.html', { root: './views' });
});

// Rota para a página de Espera Multi Player
app.get('/multiPlayer-waitRoom', (req, res) => {
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
    const { nickname, password } = req.body;

    try {
        const existente = await User.findOne({ nickname });
        if (existente) {
            return res.status(400).json({ erro: 'Nickname já existe' });
        }

        const novoUser = new User({ nickname, password });
        await novoUser.save();

        res.status(201).json({ mensagem: 'Conta criada com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar conta' });
    }
});

// Rota para login
app.post('/api/login', async (req, res) => {
    const { nickname, password } = req.body;

    try {
        const utilizador = await User.findOne({ nickname, password });
        if (!utilizador) {
            return res.status(401).json({ erro: 'Nickname ou palavra-passe incorretos' });
        }

        res.status(200).json({ mensagem: 'Login bem sucedido', utilizador });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao fazer login' });
    }
});

// ======================================================================

// 0.0.0.0 permite ligações a dispositivos na mesma rede // Neste momento redundante
// 0.0.0.0/0 é para permitir ligações de qualquer IP (útil para testes em redes externas ou com VPNs)
app.listen(PORT, '0.0.0.0', '0.0.0.0/0', () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});

// ======================================================================

// Log de Erros

/* Ignorar "Unchecked runtime.lastError" - É erro do browser, não do projeto */