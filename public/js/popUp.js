import { toggleTema } from './lightMode.js';

/**
 * Função para criar um pop-up
 */
export async function popUp(op)
{
  // Cria o overlay (camada de fundo que cobre toda a janela)
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '1050';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  
  // Cria a div do pop-up com as classes desejadas
  const containerDiv = document.createElement('div');
  containerDiv.className = 'container content popUp';
  
  // Conteúdo do pop-up
  containerDiv.innerHTML = await HTML_popUp(op);

    // Associa eventos às checkboxes do popUp
    if (op === 'config') {
        const lightMode = containerDiv.querySelector('#lightMode');
        if (lightMode) {
        lightMode.checked = localStorage.getItem('modoClaro') === 'true';
        lightMode.addEventListener('change', function() {
            toggleTema(this);
        });
        }
    }
  
  overlay.appendChild(containerDiv);
  document.body.appendChild(overlay);

  if (op === 'config') {
    const btnFechar = document.querySelector('#btnFecharConfig');
    if (btnFechar) {
        btnFechar.addEventListener('click', () => overlay.remove());
    }
  }
  
  // Fecha ao clicar fora do container (no fundo escuro)
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

/*
    Retorna o conteúdo HTML do pop-up consoante a opção escolhida.
    Esta função é assíncrona porque pode necessitar de fazer fetches para obter dados do utilizador (stats).
*/
export async function HTML_popUp(op)
{
    switch (op)
    {
        case "stats": {
        const resposta = await fetch('/api/utilizador');
        const utilizador = await resposta.json();

        // Tested
        return /*html*/ `
            <h2 class="titulo claro txtXL">Métricas de Jogador</h2>
            <div class="visibleContent1 flexiona2 pad contentSpace">
                <h4 class="titulo popUpTit">Pontuação Total: ${utilizador.metricas.totalScore}</h4>
                <h4 class="titulo popUpTit">Melhor Streak Single-Player: ${utilizador.metricas.bestStreakSingle}</h4>
                <h4 class="titulo popUpTit">Melhor Streak Multi-Player: ${utilizador.metricas.bestStreakMulti}</h4>
                <h4 class="titulo popUpTit">Número de Respostas Encontradas: ${utilizador.metricas.answersFound}</h4>
                <h4 class="titulo popUpTit">Número de Respostas Erradas: ${utilizador.metricas.answersWrong}</h4>
                <h4 class="titulo popUpTit">Tempo Total de Jogo: ${utilizador.metricas.totalTime}</h4>
            </div>
        `;

        } // break;

        case "tutorial": {
        
        // Tested
        return /*html*/ `
            <h2 class="titulo claro txtXL">Como Jogar?</h2>
            <div class="linha visibleContent1 flexiona2 pad">
                <h4 class="titulo popUpTit">
                    É apresentada uma palavra. O teu objetivo é escrever palavras que se formem com as letras dessa palavra. Desde que as letras necessárias estejam disponíveis, a palavra é válida! Tens 1 minuto por palavra. Boa sorte!
                </h4>
            </div>
        `;

        } // break;

        case "config": {
        
        // Tested
        return /*html*/ `
            <h2 class="titulo claro txtXL">Configurações</h2>
            
            <form>
                <div class="content visibleContent1 flexiona2 pad">
                    <h4 class="titulo popUpTit">Modo Díficil</h4>
                    <input type="checkbox" id="hardMode" name="hardMode">
                    <br><br>
                    <h4 class="titulo popUpTit">Modo Claro</h4>
                    <input type="checkbox" id="lightMode" name="lightMode">
                    <br><br>
                    <h4 class="titulo popUpTit">Volume</h4>
                    <input type="checkbox" id="volume" name="volume">
                    <br><br>
                    <h4 class="titulo popUpTit">"Easter Egg"</h4>
                    <input type="checkbox" id="easterEgg" name="easterEgg">
                    <br><br><br>
                </div>

                <div class="linha flexiona pad">
                    <div class="invisible flexiona">
                        <p>Chouriço</p>
                    </div>
                    <div id="btnFecharConfig" class="visibleContent1 flexiona clicavel">
                        <h2 class="titulo popUpTit">OK</h2>
                    </div>
                    <div class="invisible flexiona">
                        <p>Chouriço</p>
                    </div>
                </div>
            </form>
        `;

        } // break;

        case "salas": {

        // Fetch para obter as salas disponíveis
        const respostaSalas = await fetch('/api/sala/listar');
        // Transforma a resposta em JSON
        const salas = await respostaSalas.json();

        // Agrupa as salas em linhas de 3
        const linhas = salas.reduce((acc, s, i) => {
            if (i % 3 === 0) acc.push([]);
            acc[acc.length - 1].push(s);
            return acc;
        }, []);

        // Cria o HTML para cada linha de salas
        const listaSalas = linhas.map(linha => `
            <div class="linhaAlt">
                ${linha.map(s => `
                    <div onclick="entrarSala('${s.codigo}')" class="clicavel salaCard">
                        <h4 class="titulo claro">${s.emJogo ? 'Em jogo' : 'Em espera...'}</h4>
                        <h4 class="titulo claro">${s.codigo}</h4>
                        <div class="linha flexiona2">
                            <div class="flexCenter">
                                <img class="iconSala" src="/img/players-ModoEscuro.png" alt="players">
                            </div>
                            <div class="flexCenter">
                                <img class="iconSala" src="/img/points-ModoEscuro.png" alt="points">
                            </div>
                        </div>
                        <div class="linha flexiona flexCenter">
                            <p class="titulo claro">${s.jogadores.length}/${s.maxJogadores}</p>
                            <p class="titulo claro">${s.pontuacaoMaxima}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');

        return /*html*/ `
            <h2 class="titulo claro txtXL">Salas</h2>
            <div class="salas visibleContent1 scroll flexiona2 pad">
                ${listaSalas || '<div class="flexCenter"><h4 class="escuro">Sem salas disponíveis</h4></div>'}
            </div>
            <div class="linha flexiona pad">
                <div onclick="popUp('configSala')" class="visibleContent1 flexiona flexCenter clicavel">
                    <h2 class="titulo popUpTit">Nova Sala</h2>
                </div>
                <div class="invisible flexiona">
                    <p></p>
                </div>
                <div onclick="popUp('codeSala')" class="visibleContent1 flexiona flexCenter clicavel">
                    <h2 class="titulo popUpTit">Inserir Código</h2>
                </div>
            </div>
        `;

        } // break;

        case "configSala": {
        const codigoGerado = Math.random().toString(36).substring(2, 8).toUpperCase();

        return /*html*/ `
            <h2 class="titulo claro txtXL">Configurações de Sala</h2>
            
            <form>
                <div class="content visibleContent1 flexiona2 pad">
                    <h4 class="titulo popUpTit">Modo Díficil</h4>
                    <input type="checkbox" id="hardMode" name="hardMode">
                    <br><br>
                    <h4 class="titulo popUpTit">Pontuação máxima</h4>
                    <input class="fullWidth" type="text" id="maxPoints" name="maxPoints" value="100">
                    <br><br>
                    <h4 class="titulo popUpTit">Código da Sala</h4>
                    <input class="fullWidth" type="text" id="roomCodeConfig" name="roomCodeConfig" value="${codigoGerado}">
                    <br><br>
                    <h4 class="titulo popUpTit">Sala Privada</h4>
                    <input type="checkbox" id="roomPrivacy" name="roomPrivacy">
                    <br><br><br>
                </div>

                <div class="linha flexiona pad">
                    <div class="invisible flexiona"><p>Chouriço</p></div>
                    <div onclick="criarSala()" class="visibleContent1 flexiona flexCenter clicavel">
                        <h2 class="titulo popUpTit">Jogar</h2>
                    </div>
                    <div class="invisible flexiona"><p>Chouriço</p></div>
                </div>
            </form>
        `;

        } // break;

        case "codeSala": {

        // Tested
        return /*html*/ `
            <h2 class="titulo claro txtXL">Entrar na Sala</h2>
            
            <form>
                <div class="content visibleContent1 flexiona2 pad">
                    <h4 class="titulo popUpTit">Insira o código da sala</h4>
                    <input class="fullWidth" type="text" id="roomCodeInput" name="roomCodeInput">
                    <br><br><br>
                </div>

                <div class="linha flexiona pad">
                    <div class="invisible flexiona">
                        <p>Chouriço</p>
                    </div>
                    <div type="submit" onclick="entrarComCodigo()" class="visibleContent1 flexiona clicavel">
                        <h2 class="titulo popUpTit">Entrar</h2>
                    </div>
                    <div class="invisible flexiona">
                        <p>Chouriço</p>
                    </div>
                </div>
            </form>
        `;

        } // break;

        case "fimJogo": {

        return /*html*/ `
            <h2 class="titulo claro txtXL">Fim de Jogo!</h2>
            <div class="visibleContent1 flexiona2 pad contentSpace">
                <h4 class="titulo popUpTit">Pontuação Final: <span id="pontuacaoFinal"></span></h4>
                <h4 class="titulo popUpTit">Palavras Encontradas: <span id="palavrasEncontradas"></span></h4>
                <h4 class="titulo popUpTit">Palavras Erradas: <span id="palavrasErradas"></span></h4>
            </div>
            <div class="linha flexiona pad">
                <div class="invisible flexiona">
                    <p>Chouriço</p>
                </div>
                <div onclick="window.location.href='/'" class="visibleContent1 flexiona flexCenter clicavel">
                    <h2 class="titulo popUpTit">Sair</h2>
                </div>
                <div class="invisible flexiona">
                    <p>Chouriço</p>
                </div>
            </div>
        `;
        
        } // break;

        default: {
        return /*html*/ `<h2 class="titulo claro txtXL">Algo correu mal...</h2>`;
        }
    }
}