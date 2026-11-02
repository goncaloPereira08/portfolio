const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Utilizador = require('../models/Utilizador'); // Certifique-se de ajustar o caminho do modelo

dotenv.config(); // Carregar variáveis de ambiente

// Função de login
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Verifique se o usuário existe
    const utilizador = await Utilizador.findOne({ email });
    if (!utilizador) {
      return res.status(400).json({ erro: 'Credenciais inválidas' });
    }

    // Verifique a senha
    const isMatch = await bcrypt.compare(senha, utilizador.senha);
    if (!isMatch) {
      return res.status(400).json({ erro: 'Credenciais inválidas' });
    }

    // Gere um JWT
    const token = jwt.sign({ id: utilizador._id, email: utilizador.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login realizado com sucesso!',
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};
