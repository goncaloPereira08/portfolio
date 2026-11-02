const Loja = require("../models/Loja");

exports.criarLoja = async (req, res) => {
  try {
    const { nome, endereco, telemovel, email, responsavel_id } = req.body;

    const novaLoja = new Loja({ nome, endereco, telemovel, email, responsavel_id });
    await novaLoja.save();

    res.status(201).json({ message: "Loja criada com sucesso!", loja: novaLoja });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar loja", detalhes: error.message });
  }
};
exports.listarLojas = async (req, res) => {
  try {
    const lojas = await Loja.find().select('nome'); // ou sem .select()
    res.json(lojas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar lojas' });
  }
};

exports.atualizarLoja = async (req, res) => {
  try {
    const lojaAtualizada = await Loja.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lojaAtualizada) return res.status(404).json({ error: 'Loja não encontrada' });

    res.json({ message: 'Loja atualizada com sucesso!', loja: lojaAtualizada });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar loja', detalhes: error.message });
  }
};

exports.apagarLoja = async (req, res) => {
  try {
    const lojaRemovida = await Loja.findByIdAndDelete(req.params.id);
    if (!lojaRemovida) return res.status(404).json({ error: 'Loja não encontrada' });

    res.json({ message: 'Loja removida com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar loja', detalhes: error.message });
  }
};
