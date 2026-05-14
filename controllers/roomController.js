import Room from '../models/room.js';

// Gera um código aleatório de 6 caracteres alfanuméricos
function gerarCodigo() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
        codigo += chars[Math.floor(Math.random() * chars.length)];
    }
    return codigo;
}

// Cria uma sala
export async function criarSala(req, res) {
    const { pontuacaoMaxima, privada, codigo } = req.body;
    const nickname = req.session.utilizador.nickname;

    try {
        // Usa o código fornecido ou gera um novo
        let codigoFinal = codigo || gerarCodigo();

        // Verifica se o código já existe
        const existente = await Room.findOne({ codigo: codigoFinal });
        if (existente) return res.status(400).json({ erro: 'Código já existe' });

        const sala = new Room({
            codigo: codigoFinal,
            criador: nickname,
            jogadores: [{ nickname, pontuacao: 0 }],
            pontuacaoMaxima: pontuacaoMaxima || 100,
            privada: privada || false
        });

        await sala.save();
        res.status(201).json({ codigo: codigoFinal });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar sala' });
    }
}

// Entra numa sala
export async function entrarSala(req, res) {
    const { codigo } = req.body;
    const nickname = req.session.utilizador.nickname;

    try {
        const sala = await Room.findOne({ codigo });
        if (!sala) return res.status(404).json({ erro: 'Sala não encontrada' });
        //if (sala.emJogo) return res.status(400).json({ erro: 'Jogo já em curso' });
        if (sala.jogadores.length >= sala.maxJogadores) return res.status(400).json({ erro: 'Sala cheia' });

        // Verifica se já está na sala
        const jaExiste = sala.jogadores.find(j => j.nickname === nickname);
        if (!jaExiste) {
            sala.jogadores.push({ nickname, pontuacao: 0 });
            await sala.save();
        }

        res.json({ codigo: sala.codigo });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao entrar na sala' });
    }
}

// Lista salas públicas
export async function listarSalas(req, res) {
    try {
        const salas = await Room.find({ privada: false });
        res.json(salas);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar salas' });
    }
}

// Obtém dados de uma sala
export async function getSala(req, res) {
    const { codigo } = req.params;
    try {
        const sala = await Room.findOne({ codigo });
        if (!sala) return res.status(404).json({ erro: 'Sala não encontrada' });
        res.json(sala);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao obter sala' });
    }
}

import { getPalavraAleatoria } from './gameController.js';

// Inicia o jogo
export async function iniciarJogo(req, res) {
    const { codigo } = req.params;
    
    try {
        const sala = await Room.findOne({ codigo });
        if (!sala) return res.status(404).json({ erro: 'Sala não encontrada' });
        
        sala.emJogo = true;
        sala.numeroPalavra = 1;
        await sala.save();

        res.json({ mensagem: 'Jogo iniciado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao iniciar jogo' });
    }
}