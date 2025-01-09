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

    async updatePoints(req, res) {
      const { id } = req.params;
      const { pontos, distancia, tempo } = req.body;
  
      try {
          const [currentValues] = await connection.execute(
              'SELECT pontos, distancia, tempo FROM cyclists WHERE id = ?',
              [id]
          );
  
          if (currentValues.length === 0) {
              return res.status(404).json({ error: 'Ciclista não encontrado' });
          }
  
          // Converter e validar os valores
          const newPontos = (currentValues[0].pontos || 0) + (parseInt(pontos) || 0);
          const newDistancia = (
              parseFloat(currentValues[0].distancia || 0) + 
              parseFloat(distancia || 0)
          ).toFixed(2); // Garante 2 casas decimais
  
          const currentTime = currentValues[0].tempo ? 
              timeToSeconds(currentValues[0].tempo) : 0;
          const additionalTime = tempo ? 
              timeToSeconds(tempo) : 0;
          const newTempo = secondsToTime(currentTime + additionalTime);
  
          // Atualizar no banco de dados
          const [result] = await connection.execute(
              'UPDATE cyclists SET pontos = ?, distancia = ?, tempo = ? WHERE id = ?',
              [newPontos, newDistancia, newTempo, id]
          );
  
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'Ciclista não encontrado' });
          }
  
          res.json({
              message: 'Pontos atualizados com sucesso',
              data: {
                  id,
                  pontos: newPontos,
                  distancia: parseFloat(newDistancia),
                  tempo: newTempo
              }
          });
      } catch (error) {
          console.error('Erro ao atualizar pontos:', error);
          res.status(500).json({ 
              error: 'Erro ao atualizar pontos',
              details: error.message 
          });
      }
  }
}

// Função auxiliar para converter tempo HH:mm:ss para segundos
function timeToSeconds(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number);
    return (hours * 3600) + (minutes * 60) + seconds;
}

// Função auxiliar para converter segundos para HH:mm:ss
function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

module.exports = new CyclistController();