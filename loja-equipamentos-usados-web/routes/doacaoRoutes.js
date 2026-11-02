const express = require('express');
const Doacao = require('../models/Doacao');
const router = express.Router();

// Criar uma nova doação
router.post('/doacoes', async (req, res) => {
    try {
        const novaDoacao = new Doacao(req.body);
        await novaDoacao.save();
        res.status(201).json(novaDoacao);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar todas as doações
router.get('/doacoes', async (req, res) => {
    try {
        const doacoes = await Doacao.find();
        res.json(doacoes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
