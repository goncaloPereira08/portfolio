const CatalogoEquipamentos = require("../models/CatalogoEquipamentos");

exports.criarCatalogo = async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    const novoCatalogo = new CatalogoEquipamentos({ nome, descricao });
    await novoCatalogo.save();

    res.status(201).json({ message: "Catálogo criado com sucesso!", catalogo: novoCatalogo });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar catálogo", detalhes: error.message });
  }
};
