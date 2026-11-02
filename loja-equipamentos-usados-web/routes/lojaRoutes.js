const express = require('express');
const router = express.Router();
const lojaController = require('../controllers/LojaController');

// Criar uma nova loja usando o controlador
router.post('/lojas', lojaController.criarLoja);


// Listar todas as lojas
router.get('/lojas', lojaController.listarLojas);

// Atualizar loja
router.put('/lojas/:id', lojaController.atualizarLoja);

// Deletar loja
router.delete('/lojas/:id', lojaController.apagarLoja);


module.exports = router;
