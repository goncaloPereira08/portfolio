const express = require('express');
const router = express.Router();
const Utilizador = require('../models/Utilizador.js');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middlewares/authMiddleware');
const utilizadorController = require('../controllers/UtilizadorController');
const checkJwt = require('../middlewares/auth0Middleware');

// Só admin/empregado podem gerir outros utilizadores
const isGestor = (user) => user && ['admin', 'empregado'].includes(user.role);

router.post('/criar', utilizadorController.criarUtilizador);

router.get('/perfil', authMiddleware, async (req, res) => {
  try {
    let user;

    if (req.user && req.user.id) {
      user = await Utilizador.findById(req.user.id).select('-senha');
    } else if (req.auth && req.auth.sub) {
      const sub = req.auth.sub;
      user = await Utilizador.findOne({ auth0Id: sub });

      if (!user) {
        user = new Utilizador({
          nome: req.auth.nickname || req.auth.name,
          email: req.auth.email,
          role: 'cliente',
          auth0Id: sub,
        });
        await user.save();
      }
    }

    if (!user) {
      return res.status(404).json({ mensagem: 'Utilizador não encontrado' });
    }

    // Retorna todos os campos relevantes
    res.json({
      id: user._id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      nif: user.nif,
      nic: user.nic,
      morada: user.morada,
      genero: user.genero,
      role: user.role
    });

  } catch (err) {
    console.error("Erro ao obter perfil:", err);
    res.status(500).json({ erro: 'Erro ao carregar perfil' });
  }
});







// Login de utilizador
// 🔐 Login de utilizador
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Utilizador.findOne({ nome: String(username) });

    // Mensagem genérica: não revela se o utilizador existe
    const senhaCorreta = user && user.senha && await bcrypt.compare(password, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // ✅ Gerar token JWT
    const token = jwt.sign(
      { id: user._id, nome: user.nome, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 🔐 Retornar token e dados do utilizador (sem a senha)
    res.json({
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: 'Erro interno no login' });
  }
});

// Buscar um utilizador pelo nome
router.get('/utilizadores/nome/:nome', authMiddleware, async (req, res) => {
  try {
    if (!isGestor(req.user)) return res.status(403).json({ erro: 'Acesso negado' });
    const nome = String(req.params.nome);
    const utilizador = await Utilizador.findOne({ nome: nome }).select('-senha');

    if (!utilizador) {
      return res.status(404).json({ mensagem: 'Utilizador não encontrado' });
    }

    res.json(utilizador);  // Retorna o utilizador encontrado
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


// Listar todos os utilizadores
router.get('/utilizadores', authMiddleware, async (req, res) => {
  try {
    if (!isGestor(req.user)) return res.status(403).json({ erro: 'Acesso negado' });
    const lista = await Utilizador.find().select('-senha');
    res.json(lista);  // Retorna a lista de usuários
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


// Atualizar
router.put('/utilizadores/:id', authMiddleware, async (req, res) => {
  try {
    const proprio = String(req.user.id) === String(req.params.id);
    if (!proprio && !isGestor(req.user)) return res.status(403).json({ erro: 'Acesso negado' });

    // Só são aceites campos conhecidos; o _id e a senha nunca são copiados diretamente
    const permitidos = ['nome', 'email', 'telefone', 'nif', 'nic', 'morada', 'genero'];
    const dados = {};
    for (const campo of permitidos) if (req.body[campo] !== undefined) dados[campo] = req.body[campo];

    // Alterar roles: gestores; promover a admin/empregado só um admin
    if (req.body.role !== undefined && req.body.role !== req.user.role) {
      if (!isGestor(req.user)) return res.status(403).json({ erro: 'Sem permissão para alterar a role' });
      if (['admin', 'empregado'].includes(req.body.role) && req.user.role !== 'admin') {
        return res.status(403).json({ erro: 'Só um admin pode atribuir esta role' });
      }
      dados.role = req.body.role;
    }

    // Nova password é guardada com hash
    if (proprio && req.body.senha) dados.senha = await bcrypt.hash(req.body.senha, 10);

    const atualizado = await Utilizador.findByIdAndUpdate(req.params.id, dados, { new: true, runValidators: true }).select('-senha');
    if (!atualizado) return res.status(404).json({ mensagem: 'Utilizador não encontrado' });
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Apagar
router.delete('/utilizadores/:id', authMiddleware, async (req, res) => {
  try {
    if (!isGestor(req.user)) return res.status(403).json({ erro: 'Acesso negado' });
    const apagado = await Utilizador.findByIdAndDelete(req.params.id);
    if (!apagado) return res.status(404).json({ mensagem: 'Utilizador não encontrado' });
    res.json({ mensagem: 'Utilizador removido com sucesso!' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
