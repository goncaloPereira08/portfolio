const mongoose = require('mongoose');

const CatalogoEquipamentosSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: String
}, { timestamps: true });

module.exports = mongoose.model('CatalogoEquipamentos', CatalogoEquipamentosSchema);
