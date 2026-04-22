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
window.logOff = function() {
    sessionStorage.removeItem('utilizador');
    window.location.href = '/login';
}