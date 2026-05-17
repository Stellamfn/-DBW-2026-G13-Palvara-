import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true },
    criador: { type: String, required: true },
    jogadores: [{ nickname: String, pontuacao: { type: Number, default: 0 }, pfp: String }],
    maxJogadores: { type: Number, default: 15 },
    pontuacaoMaxima: { type: Number, default: 100 },
    privada: { type: Boolean, default: false },
    emJogo: { type: Boolean, default: false },
    palavraAtual: { type: String, default: null },
    numeroPalavra: { type: Number, default: 0 },
    palavrasMestrasUsadas: { type: [String], default: [] }
});

export default mongoose.model('Room', roomSchema);