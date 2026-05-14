import fetch from 'node-fetch';
import User from '../models/user.js';

// Busca uma palavra aleatória à API do Datamuse
export async function getPalavra(req, res) {
    try {
        const resposta = await fetch('https://api.datamuse.com/words?ml=common&max=1000');
        const palavras = await resposta.json();

        const filtradas = palavras.filter(p => p.word.length >= 5 && /^[a-z]+$/.test(p.word) && !req.session.jogo.palavrasMestrasUsadas.includes(p.word));
        const aleatoria = filtradas[Math.floor(Math.random() * filtradas.length)];

        // Se o jogo ainda não existir, inicializa
        if (!req.session.jogo) {
            req.session.jogo = {
                pontuacao: 0,
                palavrasUsadas: []
            };
        }

        // Actualiza apenas a palavra actual e reinicia as palavras usadas na ronda
        req.session.jogo.palavraPrincipal = aleatoria.word;
        req.session.jogo.palavrasUsadas = [];

        // Envia também a pontuação para o frontend
        res.json({
            palavra: aleatoria.word,
            pontuacao: req.session.jogo.pontuacao
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar palavra' });
    }
}

// Verifica se a palavra submetida é válida
export async function verificarPalavra(req, res) {
    const { guess } = req.body;
    const { palavraPrincipal, palavrasUsadas } = req.session.jogo;

    // Rejeita se for só uma letra
    if (guess.length === 1) {
        return res.status(400).json({ erro: 'A palavra deve ter pelo menos 2 letras' });
    }

    // Rejeita se for a própria palavra principal
    if (guess === palavraPrincipal) {
        return res.status(400).json({ erro: 'Não podes usar a palavra principal' });
    }

    // Verifica se já foi usada
    if (palavrasUsadas.includes(guess)) {
        return res.status(400).json({ erro: 'Palavra já usada' });
    }

    // 1ª verificação — caracteres
    if (!verificarCaracteres(palavraPrincipal, guess)) {
        return res.status(400).json({ erro: 'Caracteres inválidos' });
    }

    // 2ª verificação — palavra real
    try {
        const resposta = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`);
        if (!resposta.ok) {
            return res.status(400).json({ erro: 'Palavra não encontrada no dicionário' });
        }

        // Palavra válida
        req.session.jogo.palavrasUsadas.push(guess);
        req.session.jogo.pontuacao += 5;

        res.json({
            mensagem: 'Correto!', 
            pontuacao: req.session.jogo.pontuacao,
            todasEncontradas: req.session.jogo.palavrasUsadas.length === req.session.jogo.totalPalavras
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao verificar palavra' });
    }
}

// Algoritmo de verificação de caracteres
function verificarCaracteres(palavraPrincipal, guess) {
    const letrasDisponiveis = palavraPrincipal.split('');

    for (const letra of guess) {
        const index = letrasDisponiveis.indexOf(letra);
        if (index === -1) return false;
        letrasDisponiveis.splice(index, 1);
    }

    return true;
}

export async function atualizarMetricas(req, res) {
    const { pontuacao, palavrasEncontradas, palavrasErradas } = req.body;
    const id = req.session.utilizador._id;

    try {
        await User.findByIdAndUpdate(id, {
            $inc: {
                'metricas.totalScore': pontuacao,
                'metricas.answersFound': palavrasEncontradas,
                'metricas.answersWrong': palavrasErradas
            }
        });

        // Atualiza a sessão
        req.session.utilizador = await User.findById(id);

        res.json({ mensagem: 'Métricas atualizadas' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar métricas' });
    }
}

export function iniciarJogo(req, res) {
    req.session.jogo = {
        pontuacao: 0,
        palavrasUsadas: [],
        palavraPrincipal: null,
        palavrasMestrasUsadas: [] // ← adiciona isto
    };
    res.json({ mensagem: 'Jogo iniciado' });
}

export async function getPalavraAleatoria(palavrasUsadas = []) {
    const resposta = await fetch('https://api.datamuse.com/words?ml=common&max=1000');
    const palavras = await resposta.json();

    const filtradas = palavras.filter(p => 
        p.word.length >= 5 && 
        /^[a-z]+$/.test(p.word) &&
        !palavrasUsadas.includes(p.word)
    );

    return filtradas[Math.floor(Math.random() * filtradas.length)].word;
}