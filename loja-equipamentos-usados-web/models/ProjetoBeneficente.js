const mongoose = require('mongoose');

const ProjetoBeneficenteSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: String,
    organizador_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilizador', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ProjetoBeneficente', ProjetoBeneficenteSchema);
