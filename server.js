// ======================================================================
// IMPORTANTE: ESTE FICHEIRO É PARA FICAR NO DIRETÓRIO RAIZ DO PROJETO
// ======================================================================
import express from 'express';

//Não permite injeção de html a partir dos formulários
//import sanitizeHtml from 'sanitize-html';

// Define express como a app que iremos usar
const app = express();
// Porta do servidor
const PORT = 3000;

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

// 0.0.0.0 permite ligações a dispositivos na mesma rede
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});

// Log de Erros

/* Ignorar "Unchecked runtime.lastError" - É erro do browser, não do projeto */