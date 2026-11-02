const EntidadeSemFinsLucrativos = require("../models/EntidadeSemFinsLucrativos");

exports.criarEntidade = async (req, res) => {
  try {
    const { nome, nif, endereco, telefone, email, responsavel_id } = req.body;

    const novaEntidade = new EntidadeSemFinsLucrativos({ nome, nif, endereco, telefone, email, responsavel_id });
    await novaEntidade.save();

    res.status(201).json({ message: "Entidade sem fins lucrativos criada com sucesso!", entidade: novaEntidade });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar entidade", detalhes: error.message });
  }
};
