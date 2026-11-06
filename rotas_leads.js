const { enviarEmailBoasVindas } = require('./mailer'); // Importa o mailer

module.exports = function(app, db, verificarToken) {
    
    // ==========================================
    // ROTAS DE LEADS
    // ==========================================

    app.get('/api/leads', verificarToken, async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM leads ORDER BY data_criacao DESC');
            res.json(result.rows);
        } catch (error) {
            console.error("Erro no banco ao buscar leads:", error.message);
            res.status(500).json({ error: 'Erro ao buscar leads' });
        }
    });

    app.post('/api/leads', async (req, res) => {
        try {
            const { nome, email, telefone, empresa, origem, status } = req.body;
            if (!nome || !email) return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });

            const query = `INSERT INTO leads (nome, email, telefone, empresa, origem, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            const values = [nome, email, telefone || null, empresa || null, origem || 'Site', status || 'novo'];
            const result = await db.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Erro no banco ao criar lead:", error.message);
            res.status(500).json({ error: 'Erro ao criar lead', detalhe: error.message });
        }
    });

    // ATUALIZAR LEAD (COM CONVERSÃO E ENVIO DE E-MAIL BLINDADO)
    app.put('/api/leads/:id', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { status, cliente_id } = req.body;

            console.log(`\n🔄 Movendo Lead #${id} para o status: "${status}"`);

            const query = `UPDATE leads SET status = COALESCE($1, status), cliente_id = COALESCE($2, cliente_id) WHERE id = $3 RETURNING *`;
            const result = await db.query(query, [status, cliente_id, id]);

            if (result.rows.length === 0) return res.status(404).json({ error: 'Lead não encontrado.' });

            const leadAtualizado = result.rows[0];
            const statusMinusculo = (status || '').toLowerCase();

            // Se o status indicar fechamento/convertido
            if (statusMinusculo === 'convertido' || statusMinusculo === 'fechado') {
                console.log(`⭐ Lead #${id} marcado como FECHADO/CONVERTIDO.`);
                
                try {
                    const checkCliente = await db.query('SELECT id FROM clientes WHERE email = $1', [leadAtualizado.email]);
                    
                    if (checkCliente.rows.length === 0) {
                        await db.query(
                            `INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3)`,
                            [leadAtualizado.nome, leadAtualizado.email, leadAtualizado.telefone || null]
                        );
                        console.log(`✅ Cliente ${leadAtualizado.nome} criado automaticamente no banco.`);
                    } else {
                        console.log(`ℹ️ O cliente ${leadAtualizado.nome} já existia no banco.`);
                    }

                    // DISPARA O E-MAIL (Agora fora do IF, então sempre envia)
                    console.log(`✉️ Tentando disparar e-mail de boas-vindas para: ${leadAtualizado.email}...`);
                    await enviarEmailBoasVindas({
                        nome: leadAtualizado.nome,
                        email: leadAtualizado.email
                    });
                    console.log(`✅ E-mail de boas-vindas enviado com sucesso!`);

                } catch (error) {
                    console.error("❌ ERRO NO PROCESSO:", error.message);
                }
            } else {
                console.log(`➡️ Lead apenas atualizado para o status: ${status}. Nenhum e-mail disparado.`);
            }

            res.json(leadAtualizado);
        } catch (error) {
            console.error("Erro no banco ao atualizar lead:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar lead' });
        }
    });

    app.delete('/api/leads/:id', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'Lead não encontrado.' });
            res.json({ message: 'Lead excluído com sucesso.' });
        } catch (error) {
            console.error("Erro no banco ao excluir lead:", error.message);
            res.status(500).json({ error: 'Erro ao excluir lead' });
        }
    });

    // ==========================================
    // ROTAS DE TAGS
    // ==========================================
    app.get('/api/tags', verificarToken, async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM tags ORDER BY nome ASC');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar tags' });
        }
    });

    app.post('/api/leads/:id/tags', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { tag_id } = req.body;
            await db.query('INSERT INTO leads_tags (lead_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, tag_id]);
            res.status(201).json({ message: 'Tag adicionada.' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao adicionar tag' });
        }
    });

    app.delete('/api/leads/:id/tags/:tagId', verificarToken, async (req, res) => {
        try {
            const { id, tagId } = req.params;
            await db.query('DELETE FROM leads_tags WHERE lead_id = $1 AND tag_id = $2', [id, tagId]);
            res.json({ message: 'Tag removida.' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover tag' });
        }
    });

    // ==========================================
    // ROTAS DE TAREFAS
    // ==========================================

    app.get('/api/tarefas', verificarToken, async (req, res) => {
        try {
            const result = await db.query(`
                SELECT t.*, c.nome AS cliente_nome, l.nome AS lead_nome 
                FROM tarefas t
                LEFT JOIN clientes c ON c.id = t.cliente_id
                LEFT JOIN leads l ON l.id = t.lead_id
                ORDER BY t.data_criacao DESC
            `);
            res.json(result.rows);
        } catch (error) {
            console.error("Erro no banco ao buscar tarefas:", error.message);
            res.status(500).json({ error: 'Erro ao buscar tarefas' });
        }
    });

    app.get('/api/tarefas/dados', verificarToken, async (req, res) => {
        try {
            const clientes = await db.query('SELECT id, nome FROM clientes ORDER BY nome');
            const leads = await db.query('SELECT id, nome FROM leads ORDER BY nome');
            res.json({ clientes: clientes.rows, leads: leads.rows });
        } catch (error) {
            console.error("Erro ao buscar dados para tarefas:", error.message);
            res.status(500).json({ error: 'Erro ao buscar dados' });
        }
    });

    app.post('/api/tarefas', verificarToken, async (req, res) => {
        const { titulo, descricao, cliente_id, lead_id, data_vencimento } = req.body;

        if (!titulo) {
            return res.status(400).json({ error: 'O título da tarefa é obrigatório.' });
        }

        try {
            const clienteIdFinal = (cliente_id === '' || cliente_id === 'null' || cliente_id === null || cliente_id === undefined) ? null : parseInt(cliente_id);
            const leadIdFinal = (lead_id === '' || lead_id === 'null' || lead_id === null || lead_id === undefined) ? null : parseInt(lead_id);
            const dataVencimentoFinal = (data_vencimento === '' || data_vencimento === null || data_vencimento === undefined) ? null : data_vencimento;

            const query = `
                INSERT INTO tarefas (titulo, descricao, cliente_id, lead_id, data_vencimento)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const values = [titulo, descricao || null, clienteIdFinal, leadIdFinal, dataVencimentoFinal];

            const result = await db.query(query, values);
            console.log("✅ Tarefa salva com sucesso! ID:", result.rows[0].id);
            
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("❌ ERRO AO CRIAR TAREFA:", error.message);
            res.status(500).json({ error: 'Erro ao criar tarefa', detalhe: error.message });
        }
    });

    app.put('/api/tarefas/:id', verificarToken, async (req, res) => {
        const { id } = req.params;
        const { concluida } = req.body;

        try {
            const query = `UPDATE tarefas SET concluida = $1 WHERE id = $2 RETURNING *`;
            const result = await db.query(query, [concluida, id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });
            res.json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao atualizar tarefa:", error.message);
            res.status(500).json({ error: 'Erro ao atualizar tarefa' });
        }
    });

    app.delete('/api/tarefas/:id', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query('DELETE FROM tarefas WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });
            res.json({ message: 'Tarefa excluída com sucesso.' });
        } catch (error) {
            console.error("Erro ao excluir tarefa:", error.message);
            res.status(500).json({ error: 'Erro ao excluir tarefa' });
        }
    });
};