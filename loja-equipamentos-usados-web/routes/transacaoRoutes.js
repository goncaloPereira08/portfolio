const express = require('express');
const Transacao = require('../models/Transacao');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { loja_id, equipamentos, total } = req.body;

  try {
    const novaTransacao = new Transacao({
      tipo: 'compra',
      cliente_id: req.user.id,  // CORRETO aqui
      loja_id,
      equipamentos,
      total
    });

    await novaTransacao.save();

    res.status(201).json({
      message: "Transação registrada com sucesso!",
      transacao: novaTransacao
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(400).json({ error: 'Erro ao processar pagamento. Tente novamente.' });
  }
});




module.exports = router;  // exporta só o router
