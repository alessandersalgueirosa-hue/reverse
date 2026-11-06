module.exports = function(app, db, verificarToken) {
    // Rota para a Agência criar um criativo
    app.post('/api/criativos', verificarToken, async (req, res) => {
        try {
            const { cliente_id, titulo, url_arquivo } = req.body;
            if (!cliente_id || !titulo || !url_arquivo) {
                return res.status(400).json({ error: 'Preencha todos os campos.' });
            }
            const result = await db.query(
                `INSERT INTO criativos (cliente_id, titulo, url_arquivo, status) VALUES ($1, $2, $3, 'pendente') RETURNING *`, 
                [cliente_id, titulo, url_arquivo]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) { 
            res.status(500).json({ error: 'Erro no banco: ' + error.message }); 
        }
    });

    // (As rotas de listagem e aprovação do cliente ficam no rotas_portal.js)
};