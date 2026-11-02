const express = require('express');
const ProjetoBeneficente = require('../models/ProjetoBeneficente');
const router = express.Router();

// Criar um novo projeto beneficente
router.post('/projetos', async (req, res) => {
    try {
        const novoProjeto = new ProjetoBeneficente(req.body);
        await novoProjeto.save();
        res.status(201).json(novoProjeto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar todos os projetos beneficentes
router.get('/projetos', async (req, res) => {
    try {
        const projetos = await ProjetoBeneficente.find();
        res.json(projetos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
