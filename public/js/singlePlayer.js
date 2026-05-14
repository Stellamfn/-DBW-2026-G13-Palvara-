// Ativa o modo estrito do JavaScript, que não faz com que o mesmo não tente "adivinhar tudo" o que queremos fazermon
'use strict';

// Mensagem de confirmação de que o ficheiro JS está ligado ao HTML
console.log("js conectado");

// Importa as funções aplicarTema() e toggleTema() de lightMode.js
import { aplicarTema, toggleTema } from './lightMode.js';

// Torna a função acessível no html
aplicarTema();

// Importa as funções popUp() e HTML_popUp() de utils.js
import { popUp } from './popUp.js';

// Torna a função acessível no html
window.popUp = popUp;

// ============================== Jogo ==============================

let pontuacao = 0;
let temporizador;
let palavraAtual;

let numeroPalavra = 1;
let palavrasEncontradas = 0;
let palavrasErradas = 0;

// Atualiza indicador de palavra
function atualizarIndicador() {
    document.getElementById('indicadorPalavra').textContent = `Palavra ${numeroPalavra} de 10`;
}

// Atualiza a pontuação no HTML
function atualizarPontuacao() {
    document.querySelector('.titulo.claro').textContent = `Pontuação: ${pontuacao}`;
}

// Inicia o timer de 1 minuto
function iniciarTimer(callback) {
    let segundos = 60;

    temporizador = setInterval(() => {
        segundos--;

        const min = Math.floor(segundos / 60).toString().padStart(2, '0');
        const seg = (segundos % 60).toString().padStart(2, '0');
        document.querySelector('.espacoPequeno h5').textContent = `Tempo: ${min}:${seg}`;

        if (segundos <= 0) {
            clearInterval(temporizador);
            callback();
        }
    }, 1000);
}

// Busca uma nova palavra e começa a ronda
async function novaRonda() {
    const resposta = await fetch('/api/jogo/palavra');
    const dados = await resposta.json();

    palavraAtual = dados.palavra;
    pontuacao = dados.pontuacao;
    atualizarPontuacao();
    document.getElementById('listaPalavras').innerHTML = '';
    document.querySelector('.titulo.escuro').textContent = palavraAtual;
    document.getElementById('guess').value = '';

    iniciarTimer(proximaPalavra);
}

// Passa para a próxima palavra ou termina o jogo
async function proximaPalavra() {
    clearInterval(temporizador);

    if (numeroPalavra >= 10) {
        // Atualiza métricas na BD
        await fetch('/api/jogo/metricas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                pontuacao,
                palavrasEncontradas,
                palavrasErradas
            })
        });

        // Mostra popUp de fim de jogo
        await popUp('fimJogo');
        document.getElementById('pontuacaoFinal').textContent = pontuacao;
        document.getElementById('palavrasEncontradas').textContent = palavrasEncontradas;
        document.getElementById('palavrasErradas').textContent = palavrasErradas;
    } else {
        numeroPalavra++;
        atualizarIndicador();
        await novaRonda();
    }
}

// Submete o guess ao pressionar Enter
document.getElementById('guess').addEventListener('keydown', async function(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const guess = this.value.trim().toLowerCase();
    if (!guess) return;

    const resposta = await fetch('/api/jogo/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
        pontuacao = dados.pontuacao;
        palavrasEncontradas++;
        atualizarPontuacao();

        const li = document.createElement('li');
        li.textContent = guess;
        document.getElementById('listaPalavras').appendChild(li);

        this.value = '';
    } else {
        this.value = '';
        palavrasErradas++;
        this.style.borderColor = 'red'; // Not working for some reason
        setTimeout(() => this.style.borderColor = '', 500);
    }
});

// Botão passar
window.passar = async function() {
    await proximaPalavra();
}

// Inicia o jogo
sessionStorage.setItem('palavrasRestantes', 10);
await fetch('/api/jogo/iniciar', { method: 'POST' });
await novaRonda();