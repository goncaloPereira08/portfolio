const express = require('express');
const Tipo = require('../models/Tipo');
const router = express.Router();
const tipoController = require('../controllers/TipoController');

// Criar um novo tipo
router.post('/', tipoController.criarTipo);

// Listar todos os tipos
router.get('/', async (req, res) => {
  try {
    const tipos = await Tipo.find();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', async (req, res) => {
  try {
    await Tipo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tipo apagada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar tipo', detalhes: error.message });
  }
});

// PUT /api/categorias/:id
router.put('/:id', async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const atualizada = await Tipo.findByIdAndUpdate(
      req.params.id,
      { nome, descricao },
      { new: true }
    );
    res.json(atualizada);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar tipo', detalhes: error.message });
  }
});


module.exports = router;
