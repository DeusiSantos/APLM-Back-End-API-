const connection = require('../config/database');

class ReserveController {
    async create(req, res) {
        const { id_ciclista, id_estacao } = req.body;

        try {
            // Verificar bicicletas disponíveis
            const [station] = await connection.execute(
                'SELECT bikes_disponiveis FROM stations WHERE id = ?',
                [id_estacao]
            );

            if (!station[0] || station[0].bikes_disponiveis <= 0) {
                return res.status(400).json({ error: 'Não há bicicletas disponíveis nesta estação' });
            }

            // Criar reserva
            const [result] = await connection.execute(
                'INSERT INTO reservas (id_ciclista, id_estacao, status, data_reserva) VALUES (?, ?, ?, NOW())',
                [id_ciclista, id_estacao, 'reservado']
            );

            // Decrementar bicicletas disponíveis
            await connection.execute(
                'UPDATE stations SET bikes_disponiveis = bikes_disponiveis - 1 WHERE id = ?',
                [id_estacao]
            );

            res.status(201).json({
                id: result.insertId,
                id_ciclista,
                id_estacao,
                status: 'reservado',
                data_reserva: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar reserva', details: error.message });
        }
    }

    async updateStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const [result] = await connection.execute(
                'UPDATE reservas SET status = ? WHERE id = ?',
                [status, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Reserva não encontrada' });
            }

            res.json({ id, status });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar status', details: error.message });
        }
    }

    async getUserActiveReserve(req, res) {
        const { id_ciclista } = req.params;

        try {
            const [rows] = await connection.execute(
                'SELECT * FROM reservas WHERE id_ciclista = ? AND (status = ? OR status = ?)',
                [id_ciclista, 'reservado', 'levantado']
            );

            if (rows.length > 0) {
                const reserva = rows[0];
                const estado = reserva.status === 'devolvido' ? 'inativo' : 'ativo';

                res.json({
                    status: "success",
                    message: `Reserva encontrada e está ${estado}.`,
                    data: reserva
                });
            } else {
                res.json({
                    status: "info",
                    message: "Nenhuma reserva ativa foi encontrada para este ciclista.",
                    data: null
                });
            }
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Erro ao buscar reserva ativa.",
                details: error.message
            });
        }
    }

    async changeToLevantado(req, res) {
        const { id } = req.params;

        try {
            const [result] = await connection.execute(
                'UPDATE reservas SET status = ? WHERE id = ?',
                ['levantado', id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Reserva não encontrada' });
            }

            res.json({
                status: "success",
                message: "Status da reserva alterado para 'levantado'.",
                data: { id, status: 'levantado' }
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao alterar status para levantado', details: error.message });
        }
    }

    async changeToDevolvido(req, res) {
        const { id } = req.params;

        try {
            const [reserva] = await connection.execute(
                'SELECT id_estacao FROM reservas WHERE id = ?',
                [id]
            );

            if (reserva.length === 0) {
                return res.status(404).json({ error: 'Reserva não encontrada' });
            }

            const [result] = await connection.execute(
                'UPDATE reservas SET status = ? WHERE id = ?',
                ['devolvido', id]
            );

            await connection.execute(
                'UPDATE stations SET bikes_disponiveis = bikes_disponiveis + 1 WHERE id = ?',
                [reserva[0].id_estacao]
            );

            res.json({
                status: "success",
                message: "Status da reserva alterado para 'devolvido'.",
                data: { id, status: 'devolvido' }
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao alterar status para devolvido', details: error.message });
        }
    }


    async iniciarTrajetoria(req, res) {
        const { id_reserva } = req.params;
        const { estacao_destino } = req.body;

        try {
            // Buscar informações da reserva
            const [reserva] = await connection.execute(
                'SELECT id_ciclista, id_estacao FROM reservas WHERE id = ?',
                [id_reserva]
            );

            if (reserva.length === 0) {
                return res.status(404).json({ error: 'Reserva não encontrada' });
            }

            // Inserir nova trajetória
            const [result] = await connection.execute(
                `INSERT INTO trajetorias 
                (id_ciclista, id_reserva, estacao_origem, estacao_destino, data_inicio) 
                VALUES (?, ?, ?, ?, NOW())`,
                [
                    reserva[0].id_ciclista,
                    id_reserva,
                    reserva[0].id_estacao,
                    estacao_destino
                ]
            );

            res.status(201).json({
                status: "success",
                message: "Trajetória iniciada com sucesso",
                data: {
                    id: result.insertId,
                    id_reserva,
                    estacao_origem: reserva[0].id_estacao,
                    estacao_destino,
                    data_inicio: new Date()
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao iniciar trajetória',
                details: error.message
            });
        }
    }

    async finalizarTrajetoria(req, res) {
        const { id_reserva } = req.params;
        const { distancia, tempo_total } = req.body;

        try {
            // Atualizar trajetória
            const [result] = await connection.execute(
                `UPDATE trajetorias 
                SET data_fim = NOW(), 
                    distancia = ?, 
                    tempo_total = ?, 
                    status = 'finalizada' 
                WHERE id_reserva = ? AND status = 'em_andamento'`,
                [distancia, tempo_total, id_reserva]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Trajetória não encontrada ou já finalizada'
                });
            }

            res.json({
                status: "success",
                message: "Trajetória finalizada com sucesso",
                data: {
                    id_reserva,
                    distancia,
                    tempo_total,
                    data_fim: new Date()
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao finalizar trajetória',
                details: error.message
            });
        }
    }

    async listarTrajetoriasCiclista(req, res) {
        const { id_ciclista } = req.params;

        try {
            const [rows] = await connection.execute(
                `SELECT t.*, 
                    so.nome as estacao_origem_nome,
                    sd.nome as estacao_destino_nome
                FROM trajetorias t
                JOIN stations so ON t.estacao_origem = so.id
                JOIN stations sd ON t.estacao_destino = sd.id
                WHERE t.id_ciclista = ?
                ORDER BY t.data_inicio DESC`,
                [id_ciclista]
            );

            res.json({
                status: "success",
                count: rows.length,
                data: rows
            });
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao listar trajetórias',
                details: error.message
            });
        }
    }

    async obterEstatisticasCiclista(req, res) {
        const { id_ciclista } = req.params;

        try {
            const [rows] = await connection.execute(
                `SELECT 
                    COUNT(*) as total_trajetorias,
                    SUM(distancia) as distancia_total,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(tempo_total))) as tempo_total,
                    AVG(distancia) as media_distancia
                FROM trajetorias
                WHERE id_ciclista = ? AND status = 'finalizada'`,
                [id_ciclista]
            );

            res.json({
                status: "success",
                data: rows[0]
            });
        } catch (error) {
            res.status(500).json({
                error: 'Erro ao obter estatísticas',
                details: error.message
            });
        }
    }
}

module.exports = new ReserveController();
