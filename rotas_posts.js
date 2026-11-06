const { enviarEmailAgencia } = require('./mailer'); // Importa o envio de e-mail

module.exports = function(app, db, verificarToken) {

    // GET - Listar posts do cliente logado
    app.get('/api/portal/posts', verificarToken, async (req, res) => {
        try {
            const clienteId = req.user.id;
            const result = await db.query(
                `SELECT * FROM posts WHERE cliente_id = $1 ORDER BY data_publicacao DESC NULLS LAST, id DESC`,
                [clienteId]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao listar posts:', error.message);
            res.status(500).json({ error: 'Erro ao buscar posts.' });
        }
    });

    // POST - Aprovar post
    app.post('/api/portal/posts/:id/aprovar', verificarToken, async (req, res) => {
        const { feedback_cliente } = req.body;
        try {
            const info = await db.query('SELECT p.titulo, c.nome AS cliente_nome FROM posts p JOIN clientes c ON c.id = p.cliente_id WHERE p.id = $1 AND p.cliente_id = $2', [req.params.id, req.user.id]);
            
            const result = await db.query(
                `UPDATE posts SET status = 'aprovado', feedback_cliente = $1 WHERE id = $2 AND cliente_id = $3 RETURNING id`,
                [feedback_cliente || null, req.params.id, req.user.id]
            );
            if (result.rowCount === 0) return res.status(404).json({ error: 'Post não encontrado.' });
            
            if (info.rows.length > 0) {
                const { titulo, cliente_nome } = info.rows[0];
                enviarEmailAgencia(
                    '✅ Post Aprovado', 
                    `<p>O cliente <strong>${cliente_nome}</strong> aprovou o post: <strong>"${titulo}"</strong>.</p>
                     <p><strong>Feedback:</strong> ${feedback_cliente || 'Nenhum feedback informado.'}</p>`
                );
            }
            
            res.json({ message: 'Post aprovado com sucesso.' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao aprovar post.' });
        }
    });

    // POST - Recusar post
    app.post('/api/portal/posts/:id/recusar', verificarToken, async (req, res) => {
        const { feedback_cliente } = req.body;
        if (!feedback_cliente || !feedback_cliente.trim()) {
            return res.status(400).json({ error: 'O feedback é obrigatório para recusar.' });
        }
        try {
            const info = await db.query('SELECT p.titulo, c.nome AS cliente_nome FROM posts p JOIN clientes c ON c.id = p.cliente_id WHERE p.id = $1 AND p.cliente_id = $2', [req.params.id, req.user.id]);
            
            const result = await db.query(
                `UPDATE posts SET status = 'recusado', feedback_cliente = $1 WHERE id = $2 AND cliente_id = $3 RETURNING id`,
                [feedback_cliente, req.params.id, req.user.id]
            );
            if (result.rowCount === 0) return res.status(404).json({ error: 'Post não encontrado.' });
            
            if (info.rows.length > 0) {
                const { titulo, cliente_nome } = info.rows[0];
                enviarEmailAgencia(
                    '❌ Post Recusado', 
                    `<p>O cliente <strong>${cliente_nome}</strong> solicitou alterações no post: <strong>"${titulo}"</strong>.</p>
                     <p><strong>Feedback:</strong> ${feedback_cliente}</p>`
                );
            }
            
            res.json({ message: 'Alteração solicitada com sucesso.' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao recusar post.' });
        }
    });
};