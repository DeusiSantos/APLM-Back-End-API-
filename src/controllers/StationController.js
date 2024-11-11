const connection = require('../config/database');

class StationController {
  async create(req, res) {
    const { nome, latitude, longitude, descricao, bikes_disponiveis } = req.body;

    try {
      const [result] = await connection.execute(
        'INSERT INTO stations (nome, latitude, longitude, descricao, bikes_disponiveis) VALUES (?, ?, ?, ?, ?)',
        [nome, latitude, longitude, descricao, bikes_disponiveis]
      );

      res.status(201).json({ 
        id: result.insertId, 
        nome, 
        latitude, 
        longitude, 
        descricao,
        bikes_disponiveis 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar estação' });
    }
  }

  async getAll(req, res) {
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM stations'
      );
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar estações' });
    }
  }

  async getById(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM stations WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Estação não encontrada' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar estação' });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const { nome, latitude, longitude, descricao, bikes_disponiveis } = req.body;

    try {
      const [result] = await connection.execute(
        'UPDATE stations SET nome = ?, latitude = ?, longitude = ?, descricao = ?, bikes_disponiveis = ? WHERE id = ?',
        [nome, latitude, longitude, descricao, bikes_disponiveis, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Estação não encontrada' });
      }

      res.json({ id, nome, latitude, longitude, descricao, bikes_disponiveis });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar estação' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const [result] = await connection.execute(
        'DELETE FROM stations WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Estação não encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar estação' });
    }
  }
}

module.exports = new StationController();
