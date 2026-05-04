import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import User from '../models/user.js';

export async function createAccount(req, res) {
    const { nickname, password } = req.body;
    try {
        const existente = await User.findOne({ nickname });
        if (existente) return res.status(400).json({ erro: 'Nickname já existe' });

        const passwordEncriptada = await bcrypt.hash(password, 10);
        const novoUser = new User({ nickname, password: passwordEncriptada });
        await novoUser.save();

        res.status(201).json({ mensagem: 'Conta criada com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar conta' });
    }
}

export async function login(req, res) {
    const { nickname, password } = req.body;
    try {
        const utilizador = await User.findOne({ nickname });
        if (!utilizador) return res.status(401).json({ erro: 'Nickname ou palavra-passe incorretos' });

        const passwordCorreta = await bcrypt.compare(password, utilizador.password);
        if (!passwordCorreta) return res.status(401).json({ erro: 'Nickname ou palavra-passe incorretos' });

        req.session.utilizador = utilizador;
        res.status(200).json({ mensagem: 'Login bem sucedido' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao fazer login' });
    }
}

export function logout(req, res) {
    req.session.destroy();
    res.redirect('/login');
}

export function getUtilizador(req, res) {
    res.json(req.session.utilizador);
}

// Rota para atualizar a imagem de perfil do utilizador
export async function updatePfp(req, res) {
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
}