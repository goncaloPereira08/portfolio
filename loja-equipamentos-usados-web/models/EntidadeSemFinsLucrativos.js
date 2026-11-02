const mongoose = require('mongoose');

const EntidadeSemFinsLucrativosSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    nif: { type: String, required: true, unique: true },
    endereco: { type: String, required: true },
    telefone: String,
    email: { type: String, required: true, unique: true },
    responsavel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilizador', required: true }
}, { timestamps: true });

module.exports = mongoose.model('EntidadeSemFinsLucrativos', EntidadeSemFinsLucrativosSchema);
