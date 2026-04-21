/**
 * Função para criar um pop-up
 */
export function popUp(op)
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
  
  // Cria a div com as classes desejadas
  const containerDiv = document.createElement('div');
  containerDiv.className = 'container content popUp';
  
  // Conteúdo do pop-up
  containerDiv.innerHTML = HTML_popUp(op);
  
  overlay.appendChild(containerDiv);
  document.body.appendChild(overlay);
  
  // Fecha ao clicar fora do container (no fundo escuro)
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

export function HTML_popUp(op)
{
    switch (op)
    {
        case "stats":
        
        // Tested
        return /*html*/ `
            <h2 class="titulo claro txtXL">Métricas de Jogador</h2>
            <div class="visibleContent1 flexiona2 pad contentSpace">
                <h4 class="titulo popUpTit">Pontuação Total:</h4>
                <h4 class="titulo popUpTit">Melhor Streak Single-Player:</h4>
                <h4 class="titulo popUpTit">Melhor Streak Multi-Player:</h4>
                <h4 class="titulo popUpTit">Número de Respostas Encontradas:</h4>
                <h4 class="titulo popUpTit">Número de Respostas Erradas:</h4>
                <h4 class="titulo popUpTit">Tempo Total de Jogo:</h4>
            </div>
        `;

        break;

        case "tutorial":
        
        // Tested
        return /*html*/ `
            <h2 class="titulo claro txtXL">Como Jogar?</h2>
            <div class="linha visibleContent1 flexiona2 pad">
                <h4 class="titulo popUpTit">
                    Serão apresentadas palavras uma por uma. Terá que digitar palavras que estejam inseridas na palavra apresentada. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </h4>
            </div>
        `;

        break;

        case "config":
        
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
                    <div type="submit" class="visibleContent1 flexiona">
                        <h2 class="titulo popUpTit">Aplicar</h2>
                    </div>
                    <div class="invisible flexiona">
                        <p>Chouriço</p>
                    </div>
                </div>
            </form>
        `;

        break;

        case "salas":
        
        // Tested
        return /*html*/ `
            <h2 class="titulo claro txtXL">Salas</h2>
            <div class="linha visibleContent1 flexiona2 pad">
                <div class="salas">
                    <p></p>
                </div>
            </div>
            <div class="linha flexiona pad">
                <div onclick="popUp('configSala')" class="visibleContent1 flexiona flexCenter">
                    <h2 class="titulo popUpTit">Nova Sala</h2>
                </div>
                <div class="invisible flexiona">
                    <p></p>
                </div>
                <div onclick="popUp('codeSala')" class="visibleContent1 flexiona flexCenter">
                    <h2 class="titulo popUpTit">Inserir Código</h2>
                </div>
            </div>
        `;

        break;

        case "configSala":
        
        // Tested
        return /*html*/ `
            <h2 class="titulo claro txtXL">Configurações de Sala</h2>
            
            <form>
                <div class="content visibleContent1 flexiona2 pad">
                    <h4 class="titulo popUpTit">Modo Díficil</h4>
                    <input type="checkbox" id="hardMode" name="hardMode">
                    <br><br>
                    <h4 class="titulo popUpTit">Pontuação máxima</h4>
                    <input class="fullWidth" type="text" id="maxPoints" name="maxPoints">
                    <br><br>
                    <h4 class="titulo popUpTit">Código da Sala</h4>
                    <input class="fullWidth" type="text" id="roomCodeConfig" name="roomCodeConfig">
                    <br><br>
                    <h4 class="titulo popUpTit">Sala Privada</h4>
                    <input type="checkbox" id="roomPrivacy" name="roomPrivacy">
                    <br><br><br>
                </div>

                <div class="linha flexiona pad">
                    <div class="invisible flexiona">
                        <p>Chouriço</p>
                    </div>
                    <div type="submit" class="visibleContent1 flexiona">
                        <h2 class="titulo popUpTit">Jogar</h2>
                    </div>
                    <div class="invisible flexiona">
                        <p>Chouriço</p>
                    </div>
                </div>
            </form>
        `;

        break;

        case "codeSala":

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
                    <div type="submit" class="visibleContent1 flexiona">
                        <h2 class="titulo popUpTit">Entrar</h2>
                    </div>
                    <div class="invisible flexiona">
                        <p>Chouriço</p>
                    </div>
                </div>
            </form>
        `;
        
        break;

        default:
        return /*html*/ `<h2 class="titulo claro txtXL">Algo correu mal...</h2>`;
    }
}