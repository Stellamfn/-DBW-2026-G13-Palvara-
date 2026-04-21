'use strict';

console.log("js conectado");

document.getElementById('btnLogin').addEventListener('click', async () => {
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;

    const resposta = await fetch('/data/users.json');
    const utilizadores = await resposta.json();

    const utilizador = utilizadores.find(u => u.nickname === nickname && u.password === password);

    if (utilizador) {
        sessionStorage.setItem('utilizador', JSON.stringify(utilizador));
        window.location.href = '/';
    } else {
        alert('Nickname ou palavra-passe incorretos');
    }
});