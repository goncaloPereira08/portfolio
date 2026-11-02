const Transacao = require("../models/Transacao");

exports.criarTransacao = async (req, res) => {
  try {
    const { tipo, cliente_id, loja_id, equipamentos, total } = req.body;

    const novaTransacao = new Transacao({ tipo, cliente_id, loja_id, equipamentos, total });
    await novaTransacao.save();

    res.status(201).json({
      message: "Transação registrada com sucesso!",
      transacao: novaTransacao
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao registrar transação",
      detalhes: error.message
    });
  }
};

