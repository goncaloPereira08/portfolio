const Utilizador = require('../models/Utilizador');
const bcrypt = require('bcryptjs');

exports.criarUtilizador = async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      telefone,
      nif,
      nic,
      morada,
      genero
    } = req.body;

    // No registo público só são aceites roles sem privilégios
    const role = ['doador', 'organizador'].includes(req.body.role) ? req.body.role : 'cliente';

    if (!nome || !senha || !email) {
      return res.status(400).json({ error: 'Nome, Email e Senha são obrigatórios.' });
    }

      // Verifica se já existe um utilizador com o mesmo email, nif ou nic
    const existente = await Utilizador.findOne({
      $or: [{ email }, { nif }, { nic }]
    });

    if (existente) {
      return res.status(409).json({
        error: 'Já existe um utilizador com este email, NIF ou NIC.'
      });
    }


    const hashedPassword = await bcrypt.hash(senha, 10);

    const novoUtilizador = new Utilizador({
      nome,
      email,
      senha: hashedPassword,
      telefone,
      nif,
      nic,
      morada,
      genero,
      role
    });

    await novoUtilizador.save();

    res.status(201).json({
      message: "Utilizador criado com sucesso!",
      utilizador: { id: novoUtilizador._id, nome, email, role }
    });

  } catch (error) {
    console.error('Erro ao criar utilizador: ', error.message);
    res.status(500).json({
      error: "Erro ao criar Utilizador",
      detalhes: error.message
    });
  }
};


exports.getPerfil = async (req, res) => {
  try {
    const userId = req.user.id; // definido pelo middleware JWT
    const user = await Utilizador.findById(userId).select('-senha');

    if (!user) {
      return res.status(404).json({ mensagem: 'Utilizador não encontrado' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao carregar perfil' });
  }
};




