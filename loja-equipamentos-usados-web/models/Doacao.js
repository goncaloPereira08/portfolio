const mongoose = require('mongoose');

const DoacaoSchema = new mongoose.Schema({
    doador_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilizador', required: true },
    projeto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjetoBeneficente', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Doacao', DoacaoSchema);
