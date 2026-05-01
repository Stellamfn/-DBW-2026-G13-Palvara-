// Ativa o modo estrito do JavaScript, que não faz com que o mesmo não tente "adivinhar tudo" o que queremos fazer
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

// IMPORTANTE - Temporário - para uso com somente frontend

// Verifica se há sessão, se não redireciona para o login
if (!sessionStorage.getItem('utilizador')) {
    window.location.href = '/login';
}
// Termina sessão
window.logOff = async function() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
}

// Obtém os dados do utilizador
const resposta = await fetch('/api/utilizador');
const utilizador = await resposta.json();

// Atualiza a imagem de perfil e o nickname no HTML
document.getElementById('pfp').src = utilizador.pfp;
document.querySelector('#nickname').textContent = utilizador.nickname;

// Evento para atualizar a imagem de perfil caso o utilizador escolha uma nova
document.getElementById('inputPfp').addEventListener('change', async function() {
    const file = this.files[0];
    
    // Verifica ratio 1:1
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async function() {
        if (img.width !== img.height) {
            alert('A imagem tem de ser quadrada (ratio 1:1)');
            return;
        }

        const formData = new FormData();
        formData.append('pfp', file);

        const resposta = await fetch('/api/pfp', {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();
        document.getElementById('pfp').src = dados.pfp;
    };

    // Verifica tamanho máximo 500x500
    img.onload = async function() {
    if (img.width !== img.height) {
        alert('A imagem tem de ser quadrada (ratio 1:1)');
        return;
    }

    if (img.width > 500 || img.height > 500) {
        alert('A imagem não pode ter mais de 500x500 píxeis');
        return;
    }

    const formData = new FormData();
    formData.append('pfp', file);

    const resposta = await fetch('/api/pfp', {
        method: 'POST',
        body: formData
    });

    const dados = await resposta.json();
    document.getElementById('pfp').src = dados.pfp;
    };
});