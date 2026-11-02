const mongoose = require('mongoose');

const TipoSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  descricao: String
}, { timestamps: true });

module.exports = mongoose.model('Tipo', TipoSchema);
