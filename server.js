// ======================================================================
// IMPORTANTE: ESTE FICHEIRO É PARA FICAR NO DIRETÓRIO RAIZ DO PROJETO
// ======================================================================

import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.MONGO_URI);

import express from 'express';
import mongoose from 'mongoose';

//Não permite injeção de html a partir dos formulários
//import sanitizeHtml from 'sanitize-html';

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

// ======================================================================

// 0.0.0.0 permite ligações a dispositivos na mesma rede // Neste momento redundante
// 0.0.0.0/0 é para permitir ligações de qualquer IP (útil para testes em redes externas ou com VPNs)
app.listen(PORT, '0.0.0.0', '0.0.0.0/0', () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});

// ======================================================================

// Log de Erros

/* Ignorar "Unchecked runtime.lastError" - É erro do browser, não do projeto */