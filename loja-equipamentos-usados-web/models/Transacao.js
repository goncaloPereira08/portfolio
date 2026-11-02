const mongoose = require('mongoose');

const TransacaoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['compra', 'venda', 'doacao'],
    required: true
  },
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizador',
    required: true
  },
  loja_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loja',
    required: true
  },
  equipamentos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipamento',
      required: true
    }
  ],
  total: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Transacao', TransacaoSchema);
