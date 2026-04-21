'use strict';

console.log("js conectado");

document.getElementById('btnCriar').addEventListener('click', async () => {
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;

    if (!nickname || !password) {
        alert('Preenche todos os campos');
        return;
    }

    // Para já apenas redireciona, sem guardar (JSON é só leitura no frontend)
    window.location.href = '/login';
});