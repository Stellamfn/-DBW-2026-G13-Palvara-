// Ativa o modo estrito do JavaScript, que não faz com que o mesmo não tente "adivinhar tudo" o que queremos fazer
'use strict';

// Mensagem de confirmação de que o ficheiro JS está ligado ao HTML
console.log("conectado");

// Importa as funções popUp() e HTML_popUp() de utils.js
import { popUp, HTML_popUp } from './utils.js';

// Torna a função acessível no html
window.popUp = popUp;