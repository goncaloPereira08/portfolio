const mongoose = require("mongoose");
const Equipamento = require("../models/Equipamento");
const Loja = require('../models/Loja');


exports.criarEquipamento = async (req, res) => {
  try {
    const {
      nome, marca, modelo, estado, preco,
      loja_id, catalogo_id, imagem,
      categoria_id, tipo_id
    } = req.body;


    const equipamentoExistente = await Equipamento.findOne({
      nome: novoEquipamento.nome,
      marca: novoEquipamento.marca,
      modelo: novoEquipamento.modelo
    });

    if (equipamentoExistente) {
      return res.status(400).json({ error: 'Equipamento já existe com nome, marca e modelo iguais.' });
    }

    if (!nome || !marca || !modelo || !estado || !preco || !loja_id) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
    }

   // Verificação de duplicidade
    const equipamentoDuplicado = await Equipamento.findOne({ nome, marca, modelo });
    if (equipamentoDuplicado) {
      return res.status(409).json({
        message: '❌ Já existe um equipamento com esse nome, marca e modelo.',
        equipamentoExistente: equipamentoDuplicado
      });
    }


    const equipamentoData = {
      nome,
      marca,
      modelo,
      estado,
      preco,
      imagem: imagem || '../public/Images/default.jpg'
    };

    // Validações de ObjectId
    if (mongoose.Types.ObjectId.isValid(loja_id)) equipamentoData.loja_id = loja_id;
    else return res.status(400).json({ message: "ID de loja inválido" });

    if (mongoose.Types.ObjectId.isValid(catalogo_id)) equipamentoData.catalogo_id = catalogo_id;
    if (mongoose.Types.ObjectId.isValid(categoria_id)) equipamentoData.categoria_id = categoria_id;
    if (mongoose.Types.ObjectId.isValid(tipo_id)) equipamentoData.tipo_id = tipo_id;

    const novoEquipamento = new Equipamento(equipamentoData);
    await novoEquipamento.save();

    res.status(201).json({ message: "Equipamento registrado com sucesso!", equipamento: novoEquipamento });
  } catch (error) {
    console.error("Erro ao registrar equipamento:", error);
    res.status(500).json({ error: "Erro ao registrar equipamento", detalhes: error.message });
  }
};
