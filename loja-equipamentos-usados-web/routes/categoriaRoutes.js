const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');
const categoriaController = require('../controllers/CategoriaController');

router.post('/', categoriaController.criarCategoria);


// Listar todas as categorias
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', async (req, res) => {
  try {
    await Categoria.findByIdAndDelete(req.params.id);
    res.json({ message: 'Categoria apagada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar categoria', detalhes: error.message });
  }
});

// PUT /api/categorias/:id
router.put('/:id', async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const atualizada = await Categoria.findByIdAndUpdate(
      req.params.id,
      { nome, descricao },
      { new: true }
    );
    res.json(atualizada);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar categoria', detalhes: error.message });
  }
});


module.exports = router;
