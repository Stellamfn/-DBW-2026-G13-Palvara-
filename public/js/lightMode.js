'use strict';

/**
 * Aplica o tema guardado no localStorage.
 * Adiciona a classe 'modoClaro' ao body se o utilizador tiver o modo claro ativo,
 * remove-a caso contrário.
 */
export function aplicarTema() {
    const modoClaro = localStorage.getItem('modoClaro') === 'true';
    document.body.classList.toggle('modoClaro', modoClaro);
    aplicarImagens(modoClaro);
}

/**
 * Guarda a preferência do tema no localStorage e aplica-o imediatamente.
 * @param {HTMLInputElement} checkbox - A checkbox do modo claro
 */
export function toggleTema(checkbox) {
    localStorage.setItem('modoClaro', checkbox.checked);
    aplicarTema();
}

/**
 * Muda o caminho das imagens para as versões de modo claro/escuro de acordo com a variável
 * @param {boolean} modoClaro 
 */
function aplicarImagens(modoClaro) {
    const modo = modoClaro ? 'ModoClaro' : 'ModoEscuro';
    
    document.querySelectorAll('img[src*="ModoEscuro"], img[src*="ModoClaro"]').forEach(img => {
        img.src = img.src.replace(/Modo(Escuro|Claro)/, modo);
    });
}