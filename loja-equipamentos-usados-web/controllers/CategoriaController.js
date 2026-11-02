const Categoria = require("../models/Categoria");

exports.criarCategoria = async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ message: 'O campo nome é obrigatório.' });
    }

    const existente = await Categoria.findOne({ nome: nome });
    if (existente) {
      return res.status(409).json({ message: 'Categoria já existe!' });
    }

    const novaCategoria = new Categoria({ nome, descricao });
    await novaCategoria.save();

    res.status(201).json({ message: "Categoria criada com sucesso!", categoria: novaCategoria });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar categoria", detalhes: error.message });
  }
};

