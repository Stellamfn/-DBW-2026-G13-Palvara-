'use strict';

console.log("js conectado");

import { aplicarTema } from './lightMode.js';
aplicarTema();

import { popUp } from './popUp.js';
window.popUp = popUp;

const socket = io();
const codigo = window.location.pathname.split('/').pop();

const respostaUser = await fetch('/api/utilizador');
const utilizador = await respostaUser.json();
const nickname = utilizador.nickname;

let emJogo = false;
let pontuacao = 0;
let palavrasEncontradas = 0;
let palavrasErradas = 0;

// ============================== Espera ==============================

socket.emit('entrarSala', { codigo, nickname });

// Atualiza lista de jogadores
socket.on('jogadoresAtualizados', async () => {
    const resposta = await fetch(`/api/sala/${codigo}`);
    const sala = await resposta.json();

    const lista = document.getElementById('listaJogadores');
    lista.innerHTML = '';

    sala.jogadores.forEach(j => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${j.pfp || '/img/pfpDefault.png'}" alt="pfp" style="width:2vw; height:2vw; border-radius:50%; object-fit:cover;">
            <span>${j.nickname}</span>
            <span>${emJogo ? j.pontuacao + ' pts' : ''}</span>
        `;
        if (j.nickname === nickname) li.style.fontWeight = 'bold';
        lista.appendChild(li);
    });

    if (sala.criador === nickname && !emJogo) {
        document.getElementById('btnIniciar').style.display = 'block';
    }
});

window.iniciarJogo = function() {
    socket.emit('iniciarJogo', { codigo });
}

// ============================== Jogo ==============================

socket.on('jogoIniciado', () => {
    emJogo = true;

    // Atualiza o HTML para modo jogo
    document.getElementById('tituloPrincipal').textContent = '';
    document.getElementById('subtitulo').textContent = 'Tempo: 01:00';
    document.getElementById('btnIniciar').style.display = 'none';
    document.getElementById('indicadorPalavra').textContent = 'Palavra 1 de 10';
    document.getElementById('guess').disabled = false;
});

socket.on('novaPalavra', ({ palavra, numeroPalavra }) => {
    document.getElementById('tituloPrincipal').textContent = palavra;
    document.getElementById('indicadorPalavra').textContent = `Palavra ${numeroPalavra} de 10`;
    document.getElementById('guess').value = '';
    document.getElementById('listaPalavras').innerHTML = '';
});

socket.on('timer', ({ segundos }) => {
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const seg = (segundos % 60).toString().padStart(2, '0');
    document.getElementById('subtitulo').textContent = `Tempo: ${min}:${seg}`;
});

socket.on('respostaCerta', ({ pontuacao: novaPontuacao }) => {
    pontuacao = novaPontuacao;
    palavrasEncontradas++;

    const guess = document.getElementById('guess').value.trim().toLowerCase();
    const li = document.createElement('li');
    li.textContent = guess;
    li.classList.add('claro');
    document.getElementById('listaPalavras').appendChild(li);
    document.getElementById('guess').value = '';
});

socket.on('respostaErrada', () => {
    palavrasErradas++;
    const input = document.getElementById('guess');
    input.style.borderColor = 'red';
    setTimeout(() => input.style.borderColor = '', 500);
});

socket.on('jogoTerminado', ({ classificacao }) => {
    popUp('fimJogo');
    document.getElementById('pontuacaoFinal').textContent = pontuacao;
    document.getElementById('palavrasEncontradas').textContent = palavrasEncontradas;
    document.getElementById('palavrasErradas').textContent = palavrasErradas;
});

// Submete guess com Enter
document.getElementById('guess').addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const guess = this.value.trim().toLowerCase();
    if (!guess) return;

    socket.emit('submeterPalavra', { codigo, nickname, guess });
});

socket.on('criadorAtualizado', ({ antigoCriador, novoCriador }) => {
    console.log(`Novo criador da sala: ${novoCriador}`);
    
    if (novoCriador === nickname) {
        document.getElementById('btnIniciar').style.display = 'block';
    } else {
        document.getElementById('btnIniciar').style.display = 'none';
    }
});

socket.on('jogadoresAtualizados', async ({ nickname, acao, novoCriador }) => {
    const resposta = await fetch(`/api/sala/${codigo}`);
    const sala = await resposta.json();

    const lista = document.getElementById('listaJogadores');
    lista.innerHTML = '';

    sala.jogadores.forEach(j => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${j.pfp || '/img/pfpDefault.png'}" alt="pfp" style="width:2vw; height:2vw; border-radius:50%; object-fit:cover;">
            <span>${j.nickname}</span>
            <span>${emJogo ? j.pontuacao + ' pts' : ''}</span>
        `;
        if (j.nickname === nickname) li.style.fontWeight = 'bold';
        lista.appendChild(li);
    });

    if (novoCriador) {
        atualizarCriadorInterface(novoCriador);
    }
});