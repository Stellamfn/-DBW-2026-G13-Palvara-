"use strict";

/**
 * @fileoverview Script dos formulários: validação de formulário com feedback
 * visual (Bootstrap), inserção dinâmica de comentários com data/hora, validação de
 * e-mail por expressão regular e sanitização de texto para evitar injeção de HTML.
 */

// ---------------------------------------------------------------------------
// Referências ao DOM (enunciado: botão de submissão e objeto com os campos)
// ---------------------------------------------------------------------------

/**
 * Botão de submissão do formulário. Mantido como referência explícita, embora o
 * fluxo principal use o evento {@link HTMLFormElement#submit} no elemento &lt;form&gt;.
 * @type {HTMLButtonElement|null}
 */
const submitButton = document.getElementById("submitButton");

/**
 * Mapa dos principais campos do formulário, indexados por significado (nome, e-mail, comentário).
 * Facilita percorrer todos os campos num único ciclo de validação.
 * @type {{ name: HTMLInputElement|null, email: HTMLInputElement|null, comment: HTMLTextAreaElement|null }}
 */
const fields = {
    name: document.getElementById("nameInput"),
    email: document.getElementById("emailInput"),
    comment: document.getElementById("commentTextarea")
};

/**
 * Contentor onde cada comentário validado é acrescentado ao final da lista.
 * @type {HTMLElement|null}
 */
const commentsSection = document.getElementById("commentsSection");

/**
 * Formulário que agrupa os campos; o listener de {@link HTMLFormElement#submit}
 * permite impedir o envio HTTP predefinido com {@link Event#preventDefault}.
 * @type {HTMLFormElement|null}
 */
const commentForm = document.getElementById("commentForm");

// ---------------------------------------------------------------------------
// Constantes de validação
// ---------------------------------------------------------------------------

/**
 * Padrão para formato “humano” de e-mail: parte local, @, domínio com pelo menos um ponto.
 * Não implementa a complexidade total das RFC, mas serve ao desafio pedido no enunciado.
 * @type {RegExp}
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Inicialização de eventos
// ---------------------------------------------------------------------------

if (commentForm) {
    if (submitButton && submitButton.form !== commentForm) {
        console.warn(
            "O botão #submitButton não está associado ao formulário #commentForm; confirme o HTML."
        );
    }
    commentForm.addEventListener("submit", handleFormSubmit);
}

/**
 * Trata o envio do formulário: cancela o comportamento nativo, valida e, se tudo for válido,
 * insere o comentário na página e repõe o formulário.
 * @param {Event} event - Evento submit do formulário (inclui {@link SubmitEvent} em browsers modernos).
 * @returns {void}
 */
function handleFormSubmit(event) {
    event.preventDefault();
    if (validateForm()) {
        appendCommentToPage();
        resetForm();
    }
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

/**
 * Percorre todas as entradas em {@link fields} e combina o resultado de cada validação
 * individual num único valor booleano (lógica “todos têm de ser válidos”).
 * @returns {boolean} true se nome, e-mail e comentário forem aceites.
 */
function validateForm() {
    let allValid = true;
    for (const key in fields) {
        if (!Object.prototype.hasOwnProperty.call(fields, key)) {
            continue;
        }
        const field = fields[key];
        if (!field) {
            continue;
        }
        let fieldValid = false;
        if (key === "email") {
            fieldValid = validateEmailField(field);
        } else {
            fieldValid = validateTextField(field);
        }
        allValid = allValid && fieldValid;
    }
    return allValid;
}

/**
 * Valida um campo de texto simples: não pode estar vazio nem conter só espaços.
 * Atualiza as classes Bootstrap {@code is-valid} / {@code is-invalid} no elemento.
 * @param {HTMLInputElement|HTMLTextAreaElement} field - Campo a validar.
 * @returns {boolean} true se o valor, após {@link String#trim}, não for vazio.
 */
function validateTextField(field) {
    field.classList.remove("is-valid", "is-invalid");
    const ok = field.value.trim() !== "";
    field.classList.add(ok ? "is-valid" : "is-invalid");
    return ok;
}

/**
 * Valida o e-mail: obrigatório (como os outros campos) e deve corresponder a {@link EMAIL_REGEX}.
 * @param {HTMLInputElement} field - Input do tipo e-mail.
 * @returns {boolean} true se preenchido e com formato aceite pela expressão regular.
 */
function validateEmailField(field) {
    field.classList.remove("is-valid", "is-invalid");
    const trimmed = field.value.trim();
    if (trimmed === "") {
        field.classList.add("is-invalid");
        return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
        field.classList.add("is-invalid");
        return false;
    }
    field.classList.add("is-valid");
    return true;
}

// ---------------------------------------------------------------------------
// Sanitização e construção do HTML do comentário
// ---------------------------------------------------------------------------

/**
 * Converte texto arbitrário do utilizador em texto seguro para inserção em HTML:
 * caracteres como &lt; e &amp; passam a entidades, evitando que o browser interprete
 * marcações ou scripts como parte do documento.
 * @param {string} text - Cadeia introduzida pelo utilizador.
 * @returns {string} Versão escapada adequada a interpolação em {@link Element#innerHTML}.
 */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Gera o fragmento HTML de um comentário. Os valores textuais devem já estar
 * {@link escapeHtml sanitizados} para não interpretarem como código HTML.
 * @param {string} safeName - Nome já escapado.
 * @param {string} safeEmail - E-mail já escapado.
 * @param {string} safeComment - Corpo do comentário já escapado (quebras de linha preservadas abaixo).
 * @param {string} dateTimeLabel - Data e hora formatadas para exibição (geradas pelo script, não pelo utilizador).
 * @returns {string} Markup a inserir com {@link Element#insertAdjacentHTML}.
 */
function buildCommentCardHtml(safeName, safeEmail, safeComment, dateTimeLabel) {
    const bodyWithBreaks = safeComment.replace(/\n/g, "<br>");
    return (
        '<article class="card mb-3 shadow-sm">' +
        '<div class="card-body">' +
        '<p class="card-text mb-1"><strong>Nome:</strong> ' + safeName + "</p>" +
        '<p class="card-text mb-1"><strong>E-mail:</strong> ' + safeEmail + "</p>" +
        '<p class="card-text mb-1"><strong>Data e hora:</strong> ' + dateTimeLabel + "</p>" +
        '<p class="card-text mb-1"><strong>Comentário:</strong></p>' +
        '<p class="card-text">' + bodyWithBreaks + "</p>" +
        "</div></article>"
    );
}

/**
 * Lê os valores atuais do formulário, sanitiza-os, regista a data/hora de submissão
 * e acrescenta o bloco ao contentor {@link commentsSection}.
 * @returns {void}
 */
function appendCommentToPage() {
    if (!commentsSection) {
        return;
    }
    const name = fields.name ? fields.name.value : "";
    const email = fields.email ? fields.email.value : "";
    const comment = fields.comment ? fields.comment.value : "";
    const submittedAt = new Date();
    const dateTimeLabel = submittedAt.toLocaleString("pt-PT", {
        dateStyle: "short",
        timeStyle: "medium"
    });
    const cardHtml = buildCommentCardHtml(
        escapeHtml(name.trim()),
        escapeHtml(email.trim()),
        escapeHtml(comment.trim()),
        escapeHtml(dateTimeLabel)
    );
    commentsSection.insertAdjacentHTML("beforeend", cardHtml);
}

// ---------------------------------------------------------------------------
// Limpeza do formulário após submissão válida
// ---------------------------------------------------------------------------

/**
 * Repõe o estado inicial dos campos e remove as classes de validação visual.
 * Só deve ser chamada depois de uma submissão considerada válida.
 * @returns {void}
 */
function resetForm() {
    for (const key in fields) {
        if (!Object.prototype.hasOwnProperty.call(fields, key)) {
            continue;
        }
        const field = fields[key];
        if (!field) {
            continue;
        }
        field.value = "";
        field.classList.remove("is-valid", "is-invalid");
    }
}

// Para verificar