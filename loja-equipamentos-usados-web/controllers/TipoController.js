const Tipo = require("../models/Tipo");

exports.criarTipo = async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({ message: 'O campo nome é obrigatório.' });
    }

    // Verifica se já existe um tipo com esse nome
    const existente = await Tipo.findOne({ nome: nome.trim() });
    if (existente) {
      return res.status(409).json({ message: 'Tipo já existe!' });
    }

    const novoTipo = new Tipo({ nome: nome.trim(), descricao });
    await novoTipo.save();

    res.status(201).json({ message: "Tipo criado com sucesso!", tipo: novoTipo });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar tipo", detalhes: error.message });
  }
};
