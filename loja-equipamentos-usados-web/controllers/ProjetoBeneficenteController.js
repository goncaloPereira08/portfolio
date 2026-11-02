const ProjetoBeneficente = require("../models/ProjetoBeneficente");

exports.criarProjeto = async (req, res) => {
  try {
    const { nome, descricao, organizador_id } = req.body;

    const novoProjeto = new ProjetoBeneficente({ nome, descricao, organizador_id });
    await novoProjeto.save();

    res.status(201).json({ message: "Projeto beneficente criado com sucesso!", projeto: novoProjeto });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar projeto beneficente", detalhes: error.message });
  }
};
