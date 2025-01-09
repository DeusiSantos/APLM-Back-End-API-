const connection = require('../config/database');

class TrajetoriaController {
    // Criar nova trajetória
    async create(req, res) {
        const { id_usuario, estacao_inicio, estacao_fim, data_inicio } = req.body;

        // Se não for fornecida data_inicio, atribui a data atual
        const dataInicio = data_inicio || new Date();

        try {
            const [result] = await connection.execute(
                `INSERT INTO trajetorias_usuario 
                (id_usuario, estacao_inicio, estacao_fim, data_inicio) 
                VALUES (?, ?, ?, ?)`,
                [id_usuario, estacao_inicio, estacao_fim, dataInicio]
            );

            res.status(201).json({
                status: "success",
                message: "Trajetória registrada com sucesso",
                data: {
                    id: result.insertId,
                    id_usuario,
                    estacao_inicio,
                    estacao_fim,
                    data_inicio: dataInicio,
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao registrar trajetória',
                details: error.message
            });
        }
    }

    // Buscar todas as trajetórias de um usuário
    async getByUser(req, res) {
        const { id_usuario } = req.params;
    
        try {
            const [rows] = await connection.execute(
                `SELECT t.id, t.id_usuario, t.estacao_inicio, t.estacao_fim, t.data_inicio, 
                    s1.nome as estacao_inicio_nome, s2.nome as estacao_fim_nome
                FROM trajetorias_usuario t
                JOIN stations s1 ON t.estacao_inicio = s1.id
                JOIN stations s2 ON t.estacao_fim = s2.id
                WHERE t.id_usuario = ?
                ORDER BY t.data_inicio DESC`,
                [id_usuario]
            );
    
            res.json({
                status: "success",
                count: rows.length,
                data: rows
            });
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao buscar trajetórias',
                details: error.message
            });
        }    
    }
}

module.exports = new TrajetoriaController();
