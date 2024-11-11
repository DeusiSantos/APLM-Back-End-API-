const connection = require('../config/database');
const bcrypt = require('bcryptjs');

class CyclistController {

    
  async create(req, res) {
    const { nome, email, telefone, senha } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(senha, 10);
      
      const [result] = await connection.execute(
        'INSERT INTO cyclists (nome, email, telefone, senha) VALUES (?, ?, ?, ?)',
        [nome, email, telefone, hashedPassword]
      );

      res.status(201).json({ id: result.insertId, nome, email, telefone });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar ciclista' });
    }
  }

  async getAll(req, res) {
    try {
      const [rows] = await connection.execute(
        'SELECT id, nome, email, telefone FROM cyclists'
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar ciclistas' });
    }
  }

  async getById(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await connection.execute(
        'SELECT id, nome, email, telefone FROM cyclists WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Ciclista não encontrado' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar ciclista' });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;

    try {
      const [result] = await connection.execute(
        'UPDATE cyclists SET nome = ?, email = ?, telefone = ? WHERE id = ?',
        [nome, email, telefone, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Ciclista não encontrado' });
      }

      res.json({ id, nome, email, telefone });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar ciclista' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const [result] = await connection.execute(
        'DELETE FROM cyclists WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Ciclista não encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar ciclista' });
    }
  }
}

module.exports = new CyclistController();