module.exports = function(app, db, verificarToken) {
    
    // 1. Buscar notificações do cliente logado (últimas 10 não lidas)
    app.get('/api/notificacoes', verificarToken, async (req, res) => {
        try {
            const u = req.user || req.usuario || req.cliente || {};
            const clienteId = u.id || u.cliente_id || u.sub;
            
            // Se for admin, não tem sino de notificação (por enquanto)
            if (u.tipo === 'admin' || u.role === 'admin') {
                return res.json([]);
            }

            const result = await db.query(
                'SELECT * FROM notificacoes WHERE cliente_id = $1 AND lida = false ORDER BY data_criacao DESC LIMIT 10',
                [clienteId]
            );
            res.json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar notificações:", error.message);
            res.status(500).json({ error: 'Erro ao buscar notificações' });
        }
    });

    // 2. Marcar notificação como lida
    app.put('/api/notificacoes/:id/ler', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            await db.query('UPDATE notificacoes SET lida = true WHERE id = $1', [id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 3. Função auxiliar para criar notificação (será usada internamente por outras rotas)
    app.criarNotificacao = async function(clienteId, titulo, mensagem, link = null) {
        try {
            await db.query(
                'INSERT INTO notificacoes (cliente_id, titulo, mensagem, link) VALUES ($1, $2, $3, $4)',
                [clienteId, titulo, mensagem, link]
            );
        } catch (e) {
            console.error("Erro ao criar notificação interna:", e.message);
        }
    };
};