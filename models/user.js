import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nickname: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pfp: { type: String, default: '/img/pfpDefault.png' },
    metricas: {
        totalScore:      { type: Number, default: 0 },
        bestStreakSingle: { type: Number, default: 0 },
        bestStreakMulti:  { type: Number, default: 0 },
        answersFound:    { type: Number, default: 0 },
        answersWrong:    { type: Number, default: 0 },
        totalTime:       { type: Number, default: 0 }
    }
});

export default mongoose.model('User', userSchema);