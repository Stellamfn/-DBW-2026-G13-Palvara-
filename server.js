// ======================================================================
// IMPORTANTE: ESTE FICHEIRO É PARA FICAR NO DIRETÓRIO RAIZ DO PROJETO
// ======================================================================
import express from 'express';

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

// ======================================================================

app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});