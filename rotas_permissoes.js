module.exports = function(app, db, verificarToken) {
    
    // Buscar permissões de um cliente
    app.get('/api/permissoes/:cliente_id', verificarToken, async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM permissoes_clientes WHERE cliente_id = $1', [req.params.cliente_id]);
            if (result.rows.length === 0) return res.json({}); // Se não tiver, retorna vazio
            res.json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao buscar permissões:", error);
            res.status(500).json({ error: 'Erro ao buscar permissões' });
        }
    });

    // Salvar permissões de um cliente
    app.post('/api/permissoes/:cliente_id', verificarToken, async (req, res) => {
        const { cliente_id } = req.params;
        const { 
            pode_ver_metricas, pode_ver_financeiro, pode_ver_calendario, 
            pode_ver_branding, pode_ver_propostas, pode_ver_campanhas, pode_ver_tarefas 
        } = req.body;

        try {
            // Verifica se já existe
            const existe = await db.query('SELECT id FROM permissoes_clientes WHERE cliente_id = $1', [cliente_id]);
            
            if (existe.rows.length > 0) {
                // Atualiza
                await db.query(`
                    UPDATE permissoes_clientes SET 
                    pode_ver_metricas = $1, pode_ver_financeiro = $2, pode_ver_calendario = $3, 
                    pode_ver_branding = $4, pode_ver_propostas = $5, pode_ver_campanhas = $6, pode_ver_tarefas = $7
                    WHERE cliente_id = $8
                `, [
                    pode_ver_metricas, pode_ver_financeiro, pode_ver_calendario, 
                    pode_ver_branding, pode_ver_propostas, pode_ver_campanhas, pode_ver_tarefas, 
                    cliente_id
                ]);
            } else {
                // Insere
                await db.query(`
                    INSERT INTO permissoes_clientes 
                    (cliente_id, pode_ver_metricas, pode_ver_financeiro, pode_ver_calendario, pode_ver_branding, pode_ver_propostas, pode_ver_campanhas, pode_ver_tarefas) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    cliente_id, pode_ver_metricas, pode_ver_financeiro, pode_ver_calendario, 
                    pode_ver_branding, pode_ver_propostas, pode_ver_campanhas, pode_ver_tarefas
                ]);
            }

            res.json({ message: 'Permissões salvas com sucesso!' });
        } catch (error) {
            console.error("Erro ao salvar permissões:", error);
            res.status(500).json({ error: 'Erro ao salvar permissões' });
        }
    });
};