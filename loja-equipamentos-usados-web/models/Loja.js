const mongoose = require('mongoose');

const LojaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    endereco: { type: String, required: true },
    telemovel: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    responsavel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilizador' }
}, { timestamps: true });

module.exports = mongoose.model('Loja', LojaSchema);
