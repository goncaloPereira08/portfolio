const Doacao = require("../models/Doacao");

exports.criarDoacao = async (req, res) => {
  try {
    const { doador_id, projeto_id } = req.body;

    const novaDoacao = new Doacao({ doador_id, projeto_id });
    await novaDoacao.save();

    res.status(201).json({ message: "Doação registrada com sucesso!", doacao: novaDoacao });
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar doação", detalhes: error.message });
  }
};
