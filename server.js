// ======================================================================
// IMPORTANTE: ESTE FICHEIRO É PARA FICAR NO DIRETÓRIO RAIZ DO PROJETO
// ======================================================================

import dotenv from 'dotenv'; // Para ler as variáveis de ambiente do ficheiro .env
dotenv.config(); // Carrega as variáveis de ambiente do ficheiro .env para process.env

import express from 'express'; // Para criar o servidor e definir as rotas
import mongoose from 'mongoose'; // Para ligar ao MongoDB
import session from 'express-session'; // Para gerir sessões de utilizadores
import sanitizeHtml from 'sanitize-html'; // Não permite injeção de html a partir dos formulários
import { createServer } from 'http'; // Para criar o servidor HTTP necessário para o Socket.IO
import { Server } from 'socket.io'; // Para criar o servidor WebSocket com Socket.IO

import userRoutes from './routes/userRoutes.js'; // Importa as rotas relacionadas com utilizadores (registo, login, etc.)
import gameRoutes from './routes/gameRoutes.js'; // Importa as rotas relacionadas com o jogo (obter palavras, submeter respostas, etc.)
import roomRoutes from './routes/roomRoutes.js'; // Importa as rotas relacionadas com as salas (criar sala, entrar em sala, etc.)
import socketController from './controllers/socketController.js'; // Importa o controlador para gerir as conexões WebSocket e a lógica do jogo em tempo real

// Define express como a app que iremos usar
const app = express();
// Porta do servidor
const PORT = 3000;

// Liga ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB ligado'))
    .catch(err => console.error('Erro ao ligar ao MongoDB:', err));

// Middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// ============================== API ==============================
app.use('/api', userRoutes);
app.use('/api/jogo', gameRoutes);
app.use('/api/sala', roomRoutes);

// ============================== Views ==============================
function autenticado(req, res, next) {
    req.session.utilizador ? next() : res.redirect('/login');
}

app.get('/', autenticado, (req, res) => res.sendFile('index.html', { root: './views' }));
app.get('/singlePlayer', autenticado, (req, res) => res.sendFile('singlePlayer.html', { root: './views' }));
app.get('/multiPlayer/:codigo', autenticado, (req, res) => res.sendFile('multiplayer.html', { root: './views' }));
app.get('/sign-in', (req, res) => res.sendFile('createAccountPage.html', { root: './views' }));
app.get('/login', (req, res) => res.sendFile('loginPage.html', { root: './views' }));

// ============================== Socket.IO ==============================
const httpServer = createServer(app); // Cria um servidor HTTP a partir da app Express, necessário para o Socket.IO
const io = new Server(httpServer); // Cria um servidor WebSocket com Socket.IO usando o servidor HTTP criado

socketController(io); // Chama a função do controlador de sockets, passando o servidor Socket.IO para gerir as conexões e a lógica do jogo em tempo real

// 0.0.0.0 permite ligações a dispositivos na mesma rede // Neste momento redundante
// 0.0.0.0/0 é para permitir ligações de qualquer IP (útil para testes em redes externas ou com VPNs
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});
//67