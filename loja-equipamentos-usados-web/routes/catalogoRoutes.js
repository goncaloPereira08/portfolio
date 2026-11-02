const express = require('express');
const CatalogoEquipamentos = require('../models/CatalogoEquipamentos');
const router = express.Router();

// Criar um novo catálogo
router.post('/catalogos', async (req, res) => {
    try {
        const novoCatalogo = new CatalogoEquipamentos(req.body);
        await novoCatalogo.save();
        res.status(201).json(novoCatalogo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar todos os catálogos
router.get('/catalogos', async (req, res) => {
    try {
        const catalogos = await CatalogoEquipamentos.find();
        res.json(catalogos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
