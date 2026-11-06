module.exports = function(app, db, verificarToken) {
    
    // ROTA PARA BUSCAR O BRIEFING
    app.get('/api/portal/briefing', verificarToken, async (req, res) => {
        try {
            let clienteId = req.user.tipo === 'cliente' ? req.user.id : req.query.cliente_id;
            
            if (!clienteId && req.user.tipo !== 'cliente') {
                const cli = await db.query('SELECT id FROM clientes LIMIT 1');
                if (cli.rows.length > 0) clienteId = cli.rows[0].id;
            }

            if (!clienteId) return res.status(400).json({ error: 'Cliente não identificado.' });

            const result = await db.query('SELECT * FROM briefings WHERE cliente_id = $1', [clienteId]);
            res.json(result.rows[0] || {});
        } catch (error) {
            console.error("❌ ERRO AO BUSCAR BRIEFING:", error.message);
            res.status(500).json({ error: 'Erro ao buscar briefing' });
        }
    });

    // ROTA PARA SALVAR O BRIEFING
    app.post('/api/portal/briefing', verificarToken, async (req, res) => {
        try {
            let clienteId = req.user.tipo === 'cliente' ? req.user.id : req.query.cliente_id;
            
            if (!clienteId && req.user.tipo !== 'cliente') {
                const cli = await db.query('SELECT id FROM clientes LIMIT 1');
                if (cli.rows.length > 0) clienteId = cli.rows[0].id;
            }

            if (!clienteId) return res.status(400).json({ error: 'Cliente não identificado.' });

            const { empresa, segmento, publico_alvo, concorrentes, diferenciais, identidade_visual, redes_sociais, site } = req.body;

            const existe = await db.query('SELECT id FROM briefings WHERE cliente_id = $1', [clienteId]);
            
            if (existe.rows.length > 0) {
                await db.query(`
                    UPDATE briefings SET 
                        empresa=$1, segmento=$2, publico_alvo=$3, concorrentes=$4, 
                        diferenciais=$5, identidade_visual=$6, redes_sociais=$7, site=$8, status='respondido'
                    WHERE cliente_id=$9
                `, [empresa, segmento, publico_alvo, concorrentes, diferenciais, identidade_visual, redes_sociais, site, clienteId]);
            } else {
                await db.query(`
                    INSERT INTO briefings (cliente_id, empresa, segmento, publico_alvo, concorrentes, diferenciais, identidade_visual, redes_sociais, site, status) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'respondido')
                `, [clienteId, empresa, segmento, publico_alvo, concorrentes, diferenciais, identidade_visual, redes_sociais, site]);
            }

            res.status(201).json({ message: 'Briefing salvo com sucesso!' });
        } catch (error) {
            console.error("❌ ERRO NO BANCO (BRIEFING):", error.message);
            res.status(500).json({ error: 'Erro interno ao salvar briefing' });
        }
    });
};