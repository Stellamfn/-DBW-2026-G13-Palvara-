import Room from '../models/room.js';
import { getPalavraAleatoria } from './gameController.js';

// Verifica se as letras do palpite podem ser formadas com as letras da palavra principal
function verificarCaracteres(palavraPrincipal, guess) {
    const letrasDisponiveis = palavraPrincipal.split('');
    for (const letra of guess) {
        const index = letrasDisponiveis.indexOf(letra);
        if (index === -1) return false;
        letrasDisponiveis.splice(index, 1);
    }
    return true;
}

// Finaliza o jogo, envia classificação e remove a sala após um delay
async function terminarJogo(codigo, io) {
    try {
        const sala = await Room.findOne({ codigo });
        if (!sala) return;

        // Marca o jogo como finalizado e salva
        sala.emJogo = false;
        await sala.save();

        // Ordena jogadores por pontuação (maior para menor)
        const classificacao = sala.jogadores.sort((a, b) => b.pontuacao - a.pontuacao);
        io.to(codigo).emit('jogoTerminado', { classificacao });

        // Pequeno delay antes de deletar para garantir que o evento seja recebido pelos clientes
        setTimeout(async () => {
            await Room.deleteOne({ codigo });
            console.log(`Sala ${codigo} apagada`);
        }, 1000);
    } catch (error) {
        console.error('Erro ao terminar jogo:', error);
    }
}

// Gerencia o timer da sala (60 segundos por palavra)
// Usa findOneAndUpdate para evitar conflitos de versão com operações concorrentes
async function iniciarTimerSala(codigo, io, timerId) {
    let segundos = 60;

    const timer = setInterval(async () => {
        try {
            segundos--;
            io.to(codigo).emit('timer', { segundos });

            if (segundos <= 0) {
                clearInterval(timer);

                // Busca a sala para verificar o estado atual
                const sala = await Room.findOne({ codigo });
                if (!sala) return;

                // Verifica se já atingiu o limite de palavras
                if (sala.numeroPalavra >= 10) {
                    await terminarJogo(codigo, io);
                } else {
                    // Gera nova palavra que ainda não foi usada
                    const palavra = await getPalavraAleatoria(sala.palavrasMestrasUsadas);
                    
                    // ATUALIZAÇÃO ATÔMICA: Evita o VersionError usando findOneAndUpdate
                    // Em vez de buscar, modificar e salvar (que pode causar conflitos),
                    // faz tudo em uma única operação atômica no banco
                    await Room.findOneAndUpdate(
                        { codigo },
                        {
                            $set: { palavraAtual: palavra },           // Define a nova palavra
                            $inc: { numeroPalavra: 1 },               // Incrementa o contador em 1
                            $push: { palavrasMestrasUsadas: palavra } // Adiciona ao array de usadas
                        },
                        { returnDocument: 'after' } // Retorna o documento atualizado (substitui o depreciado 'new: true')
                    );

                    // Notifica os jogadores sobre a nova palavra
                    io.to(codigo).emit('novaPalavra', { 
                        palavra, 
                        numeroPalavra: sala.numeroPalavra + 1 
                    });
                    
                    // Reinicia o timer recursivamente para a próxima palavra
                    iniciarTimerSala(codigo, io, timer);
                }
            }
        } catch (error) {
            console.error('Erro no timer:', error);
            clearInterval(timer); // Para o timer em caso de erro para evitar loops infinitos
        }
    }, 1000);

    return timer; // Retorna o timer para permitir limpeza futura
}

export default function socketController(io) {
    // Mapa para armazenar referências dos timers ativos por sala
    // Permite limpar os timers quando o jogo termina ou a sala é destruída
    const timersSalas = new Map();

    io.on('connection', (socket) => {
        console.log('Jogador conectado:', socket.id);

        // Evento quando um jogador entra em uma sala
        socket.on('entrarSala', ({ codigo, nickname }) => {
            socket.data.codigo = codigo;
            socket.data.nickname = nickname;
            socket.join(codigo); // Adiciona o socket à room do Socket.IO
            io.to(codigo).emit('jogadoresAtualizados', { nickname, acao: 'entrou' });
        });

        // Evento para iniciar o jogo (apenas o criador pode iniciar)
        socket.on('iniciarJogo', async ({ codigo }) => {
            try {
                // ATUALIZAÇÃO ATÔMICA: Inicializa o estado do jogo em uma única operação
                // Substitui os múltiplos save() que causavam VersionError
                const sala = await Room.findOneAndUpdate(
                    { codigo },
                    {
                        $set: {
                            emJogo: true,
                            numeroPalavra: 1,
                            palavrasMestrasUsadas: [] // Limpa o array de palavras usadas
                        }
                    },
                    { returnDocument: 'after' } // Retorna o documento atualizado (substitui o depreciado 'new: true')
                );

                if (!sala) return;

                console.log('depois:', sala.emJogo); // Mantido o console.log original

                // Gera a primeira palavra aleatória
                const palavra = await getPalavraAleatoria([]);
                
                // SEGUNDA ATUALIZAÇÃO ATÔMICA: Adiciona a primeira palavra
                // Separada porque precisamos gerar a palavra primeiro
                await Room.findOneAndUpdate(
                    { codigo },
                    {
                        $set: { palavraAtual: palavra },
                        $push: { palavrasMestrasUsadas: palavra }
                    },
                    { returnDocument: 'after' } // Retorna o documento atualizado
                );

                // Envia o código da sala e a primeira palavra para todos os jogadores
                io.to(codigo).emit('jogoIniciado', { codigo }); // Envia o código da sala
                io.to(codigo).emit('novaPalavra', { palavra, numeroPalavra: 1 });
                
                // Inicia o timer da primeira palavra e armazena sua referência
                const timer = await iniciarTimerSala(codigo, io);
                timersSalas.set(codigo, timer);
                
            } catch (error) {
                console.error('Erro ao iniciar jogo:', error);
            }
        });

        // Evento quando um jogador submete uma palavra
        socket.on('submeterPalavra', async ({ codigo, nickname, guess }) => {
            try {
                const sala = await Room.findOne({ codigo });
                if (!sala || !sala.emJogo) return;

                // Encontra o jogador que submeteu a palavra
                const jogador = sala.jogadores.find(j => j.nickname === nickname);
                if (!jogador) return;

                // Verifica se a palavra pode ser formada com as letras disponíveis
                if (!verificarCaracteres(sala.palavraAtual, guess)) {
                    socket.emit('respostaErrada', { erro: 'Caracteres inválidos' });
                    return;
                }

                // Consulta a API de dicionário para verificar se a palavra existe
                const respostaDic = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`);
                if (!respostaDic.ok) {
                    socket.emit('respostaErrada', { erro: 'Palavra não encontrada' });
                    return;
                }

                // ATUALIZAÇÃO ATÔMICA: Incrementa a pontuação do jogador específico
                // Usa o operador $ para atualizar apenas o elemento do array que corresponde ao nickname
                const salaAtualizada = await Room.findOneAndUpdate(
                    { 
                        codigo, 
                        'jogadores.nickname': nickname  // Filtra o jogador específico
                    },
                    { 
                        $inc: { 'jogadores.$.pontuacao': 5 } // Incrementa a pontuação em 5
                    },
                    { returnDocument: 'after' } // Retorna o documento atualizado (substitui o depreciado 'new: true')
                );

                if (!salaAtualizada) return;

                // Busca o jogador atualizado no documento retornado
                const jogadorAtualizado = salaAtualizada.jogadores.find(j => j.nickname === nickname);

                // Notifica apenas o jogador que acertou sobre sua nova pontuação
                socket.emit('respostaCerta', { 
                    pontuacao: jogadorAtualizado.pontuacao 
                });
                
                // Notifica todos os jogadores sobre a lista atualizada
                io.to(codigo).emit('jogadoresAtualizados', salaAtualizada.jogadores);

                // Verifica se o jogador atingiu a pontuação máxima
                if (jogadorAtualizado.pontuacao >= salaAtualizada.pontuacaoMaxima) {
                    // LIMPEZA DO TIMER: Para o timer antes de terminar o jogo
                    const timer = timersSalas.get(codigo);
                    if (timer) {
                        clearInterval(timer);
                        timersSalas.delete(codigo);
                    }
                    await terminarJogo(codigo, io);
                }
            } catch (error) {
                console.error('Erro ao submeter palavra:', error);
            }
        });

        // Evento quando um jogador desconecta
        socket.on('disconnect', async () => {
            try {
                const { codigo, nickname } = socket.data;
                if (!codigo) return;

                const sala = await Room.findOne({ codigo });
                if (!sala) return;

                // Se o jogo está em andamento e todos saíram, limpa a sala
                if (sala.emJogo) {
                    // Verifica quantos sockets ainda estão na sala
                    const socketsNaSala = await io.in(codigo).fetchSockets();
                    if (socketsNaSala.length === 0) {
                        // LIMPEZA DO TIMER: Remove o timer da sala abandonada
                        const timer = timersSalas.get(codigo);
                        if (timer) {
                            clearInterval(timer);
                            timersSalas.delete(codigo);
                        }
                        await Room.deleteOne({ codigo });
                        console.log(`Sala ${codigo} apagada (jogo abandonado)`);
                    }
                    return;
                }

                // ATUALIZAÇÃO ATÔMICA: Remove o jogador do array de jogadores
                const salaAtualizada = await Room.findOneAndUpdate(
                    { codigo },
                    { 
                        $pull: { jogadores: { nickname } } // Remove o jogador pelo nickname
                    },
                    { returnDocument: 'after' } // Retorna o documento atualizado (substitui o depreciado 'new: true')
                );

                if (!salaAtualizada) return;

                // Se não há mais jogadores, apaga a sala
                if (salaAtualizada.jogadores.length === 0) {
                    // Se não há mais jogadores, apaga a sala
                    await Room.deleteOne({ codigo });
                    console.log(`Sala ${codigo} apagada`);
                } else {
                    // Se o criador saiu e ainda há jogadores, transfere a liderança
                    if (salaAtualizada.criador === nickname) {
                        // Pega o primeiro jogador restante como novo criador
                        const novoCriador = salaAtualizada.jogadores[0].nickname;
                        
                        // ATUALIZAÇÃO ATÔMICA: Transfere a liderança
                        await Room.findOneAndUpdate(
                            { codigo },
                            { $set: { criador: novoCriador } },
                            { returnDocument: 'after' } // Retorna o documento atualizado
                        );
                        
                        console.log(`Criador da sala ${codigo} transferido de ${nickname} para ${novoCriador}`);
                        
                        // Emite evento informando a mudança de criador
                        io.to(codigo).emit('criadorAtualizado', { 
                            antigoCriador: nickname, 
                            novoCriador: novoCriador 
                        });
                    }
                    
                    // Emite atualização da lista de jogadores
                    io.to(codigo).emit('jogadoresAtualizados', { 
                        nickname, 
                        acao: 'saiu',
                        novoCriador: salaAtualizada.criador !== nickname ? salaAtualizada.criador : null
                    });
                }
            } catch (error) {
                console.error('Erro no disconnect:', error);
            }
        });
    });
}