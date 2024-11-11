const connection = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
  async register(req, res) {
    const { nome, email, telefone, senha } = req.body;

    try {
      // Verificar se o email já existe
      const [existingUser] = await connection.execute(
        'SELECT id FROM cyclists WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Criptografar a senha
      const hashedPassword = await bcrypt.hash(senha, 10);
      
      // Inserir novo usuário
      const [result] = await connection.execute(
        'INSERT INTO cyclists (nome, email, telefone, senha) VALUES (?, ?, ?, ?)',
        [nome, email, telefone, hashedPassword]
      );

      // Gerar token JWT
      const token = jwt.sign(
        { id: result.insertId, email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Resposta sem dados do usuário, apenas mensagem e token
      res.status(201).json({
        mensagem: 'Usuário criado com sucesso',
        token
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }

  async login(req, res) {
    const { email, senha } = req.body;

    try {
      // Buscar usuário pelo email
      const [users] = await connection.execute(
        'SELECT * FROM cyclists WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const user = users[0];

      // Verificar senha
      const isValidPassword = await bcrypt.compare(senha, user.senha);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Resposta com apenas mensagem e token
      res.json({
        mensagem: 'Usuário logado com sucesso',
        token
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao realizar login' });
    }
  }
}

module.exports = new AuthController();
