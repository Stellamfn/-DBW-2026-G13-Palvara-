// Ativa o modo estrito do JavaScript, que não faz com que o mesmo não tente "adivinhar tudo" o que queremos fazer
'use strict';

// Mensagem de confirmação de que o ficheiro JS está ligado ao HTML
console.log("js conectado")

// Importa as funções aplicarTema() e toggleTema() de lightMode.js
import { aplicarTema, toggleTema } from './lightMode.js';

// Torna a função acessível no html
aplicarTema();

document.getElementById('btnLogin').addEventListener('click', async () => {
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;

    const resposta = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, password })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
        sessionStorage.setItem('utilizador', JSON.stringify(dados.utilizador));
        window.location.href = '/';
    } else {
        document.getElementById('erroLogin').textContent = dados.erro;
    }
});