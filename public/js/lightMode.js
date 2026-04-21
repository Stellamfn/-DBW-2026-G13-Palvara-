'use strict';

/**
 * Aplica o tema guardado no localStorage.
 * Adiciona a classe 'modoClaro' ao body se o utilizador tiver o modo claro ativo,
 * remove-a caso contrário.
 */
export function aplicarTema() {
    const modoClaro = localStorage.getItem('modoClaro') === 'true';
    document.body.classList.toggle('modoClaro', modoClaro);
}

/**
 * Guarda a preferência do tema no localStorage e aplica-o imediatamente.
 * @param {HTMLInputElement} checkbox - A checkbox do modo claro
 */
export function toggleTema(checkbox) {
    localStorage.setItem('modoClaro', checkbox.checked);
    aplicarTema();
}