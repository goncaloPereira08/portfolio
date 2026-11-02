const mongoose = require('mongoose');

const UtilizadorSchema = new mongoose.Schema({
  nome: { type: String, required: true },             // username
  senha: { type: String, required: true },            // password
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  telefone: { type: String },
  nif: { type: String, required: true },
  nic: { type: String, required: true },
  morada: { type: String, required: true },
  genero: { type: String, enum: ['Masculino', 'Feminino', 'Outro'], required: true },
  role: { type: String, enum: ['cliente', 'empregado', 'organizador', 'doador', 'admin'], default: 'cliente' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Utilizador', UtilizadorSchema);
