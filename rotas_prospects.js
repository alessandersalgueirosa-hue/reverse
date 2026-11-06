module.exports = function(app, db, verificarToken) {
    
    // 1. BUSCAR TODOS OS PROSPECTS
    app.get('/api/prospects', verificarToken, async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM prospects ORDER BY data_criacao DESC');
            res.json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar prospects:", error.message);
            res.status(500).json({ error: 'Erro ao buscar prospects' });
        }
    });

    // 2. CRIAR NOVO PROSPECT
    app.post('/api/prospects', verificarToken, async (req, res) => {
        try {
            const { nome, email, telefone, empresa, cargo, origem, status, observacoes } = req.body;
            
            if (!nome) return res.status(400).json({ error: 'O nome é obrigatório.' });

            const query = `
                INSERT INTO prospects (nome, email, telefone, empresa, cargo, origem, status, observacoes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;
            const values = [
                nome, 
                email || null, 
                telefone || null, 
                empresa || null, 
                cargo || null, 
                origem || 'Site', 
                status || 'novo', 
                observacoes || null
            ];
            
            const result = await db.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao criar prospect:", error.message);
            res.status(500).json({ error: 'Erro ao criar prospect', detalhe: error.message });
        }
    });

    // 3. ATUALIZAR PROSPECT
    app.put('/api/prospects/:id', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { nome, email, telefone, empresa, cargo, origem, status, observacoes } = req.body;

            const query = `
                UPDATE prospects 
                SET nome = COALESCE($1, nome),
                    email = COALESCE($2, email),
                    telefone = COALESCE($3, telefone),
                    empresa = COALESCE($4, empresa),
                    cargo = COALESCE($5, cargo),
                    origem = COALESCE($6, origem),
                    status = COALESCE($7, status),
                    observacoes = COALESCE($8, observacoes)
                WHERE id = $9
                RETURNING *
            `;
            const result = await db.query(query, [nome, email, telefone, empresa, cargo, origem, status, observacoes, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Prospect não encontrado.' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao atualizar prospect:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar prospect' });
        }
    });

    // 4. EXCLUIR PROSPECT
    app.delete('/api/prospects/:id', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query('DELETE FROM prospects WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Prospect não encontrado.' });
            }
            res.json({ message: 'Prospect excluído com sucesso.' });
        } catch (error) {
            console.error("Erro ao excluir prospect:", error.message);
            res.status(500).json({ error: 'Erro ao excluir prospect' });
        }
    });
};