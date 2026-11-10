const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const mailer = require('./mailer'); 

module.exports = function(app, db, verificarToken) {
    
    // ==========================================
    // TAREFAS (ADMIN) - ROTAS CORRIGIDAS
    // ==========================================
    app.get('/api/admin/tarefas/dados', verificarToken, async (req, res) => {
        try {
            const clientes = await db.query('SELECT id, nome FROM clientes ORDER BY nome');
            const leads = await db.query('SELECT id, nome FROM leads ORDER BY nome');
            res.json({ clientes: clientes.rows, leads: leads.rows });
        } catch (error) {
            console.error("Erro ao buscar dados de tarefas:", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/admin/tarefas', verificarToken, async (req, res) => {
        try {
            const result = await db.query(`
                SELECT t.*, c.nome as cliente_nome, l.nome as lead_nome 
                FROM tarefas t 
                LEFT JOIN clientes c ON c.id = t.cliente_id 
                LEFT JOIN leads l ON l.id = t.lead_id 
                ORDER BY t.data_criacao DESC
            `);
            res.json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/admin/tarefas', verificarToken, async (req, res) => {
        try {
            const { titulo, descricao, cliente_id, lead_id, data_vencimento } = req.body;
            const result = await db.query(
                `INSERT INTO tarefas (titulo, descricao, cliente_id, lead_id, data_vencimento, concluida, criado_por) 
                 VALUES ($1, $2, $3, $4, $5, false, 'admin') RETURNING *`,
                [titulo, descricao || null, cliente_id || null, lead_id || null, data_vencimento || null]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao criar tarefa (Admin):", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/api/admin/tarefas/:id', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { concluida } = req.body;
            await db.query('UPDATE tarefas SET concluida = $1 WHERE id = $2', [concluida, id]);
            res.json({ success: true });
        } catch (error) {
            console.error("Erro ao atualizar tarefa:", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.delete('/api/admin/tarefas/:id', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            await db.query('DELETE FROM tarefas WHERE id = $1', [id]);
            res.json({ success: true });
        } catch (error) {
            console.error("Erro ao excluir tarefa:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // ==========================================
    // TAREFAS (PORTAL DO CLIENTE)
    // ==========================================
    app.get('/api/portal/tarefas', verificarToken, async (req, res) => {
        try {
            const u = req.user || req.usuario || req.cliente || {};
            const isCliente = u.tipo !== 'admin' && u.role !== 'admin';
            const clienteId = u.id || u.cliente_id || u.sub;

            const query = isCliente 
                ? 'SELECT * FROM tarefas WHERE cliente_id = $1 ORDER BY data_criacao DESC' 
                : 'SELECT * FROM tarefas ORDER BY data_criacao DESC';
            const params = isCliente ? [clienteId] : [];
            const result = await db.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error.message);
            res.status(500).json({ error: 'Erro ao buscar tarefas' });
        }
    });

    app.post('/api/portal/tarefas', verificarToken, async (req, res) => {
        try {
            const u = req.user || req.usuario || req.cliente || {};
            const isCliente = u.tipo !== 'admin' && u.role !== 'admin';
            const clienteId = u.id || u.cliente_id || u.sub;

            if (!isCliente || !clienteId) {
                return res.status(403).json({ error: 'Apenas clientes podem criar tarefas por esta rota.' });
            }
            
            const { titulo, descricao, data_vencimento } = req.body;
            if (!titulo) return res.status(400).json({ error: 'O título é obrigatório.' });

            const result = await db.query(
                `INSERT INTO tarefas (titulo, descricao, data_vencimento, cliente_id, concluida, criado_por) 
                 VALUES ($1, $2, $3, $4, false, 'cliente') RETURNING *`,
                [titulo, descricao || null, data_vencimento || null, clienteId]
            );

            try {
                if (mailer && mailer.enviarEmailAgencia) {
                    const infoCliente = await db.query('SELECT nome FROM clientes WHERE id = $1', [clienteId]);
                    const nomeCliente = infoCliente.rows[0]?.nome || 'Um cliente';
                    
                    mailer.enviarEmailAgencia(
                        '📌 Nova Tarefa Solicitada pelo Cliente', 
                        `<p>O cliente <strong>${nomeCliente}</strong> criou uma nova tarefa no portal:</p>
                         <p><strong>Título:</strong> ${titulo}</p>
                         <p><strong>Descrição:</strong> ${descricao || 'Sem descrição'}</p>
                         <p><strong>Prazo Desejado:</strong> ${data_vencimento ? new Date(data_vencimento).toLocaleDateString('pt-BR') : 'Não informado'}</p>`
                    ).catch(() => {});
                }
            } catch (e) { console.error("Erro ao notificar agência:", e); }

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao criar tarefa pelo cliente:", error.message);
            res.status(500).json({ error: 'Erro ao criar tarefa.' });
        }
    });

    // ==========================================
    // CRIATIVOS (Listar, Aprovar e Recusar)
    // ==========================================
    app.get('/api/portal/criativos', verificarToken, async (req, res) => {
        try {
            const u = req.user || req.usuario || req.cliente || {};
            const isCliente = u.tipo !== 'admin' && u.role !== 'admin';
            const clienteId = u.id || u.cliente_id || u.sub;
            
            const query = isCliente 
                ? 'SELECT c.*, c.feedback AS feedback_cliente, cl.nome AS cliente_nome FROM criativos c LEFT JOIN clientes cl ON cl.id = c.cliente_id WHERE c.cliente_id = $1 ORDER BY c.data_criacao DESC'
                : 'SELECT c.*, c.feedback AS feedback_cliente, cl.nome AS cliente_nome FROM criativos c LEFT JOIN clientes cl ON cl.id = c.cliente_id ORDER BY c.data_criacao DESC';
            const params = isCliente ? [clienteId] : [];
            const result = await db.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar criativos:", error.message);
            res.status(500).json({ error: 'Erro ao buscar criativos' });
        }
    });

    app.post('/api/portal/criativos/:id/aprovar', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { feedback_cliente } = req.body;

            await db.query("UPDATE criativos SET status = 'aprovado', feedback = $1 WHERE id = $2", [feedback_cliente || null, id]);
            res.json({ message: 'Criativo aprovado com sucesso!' });

            try {
                const info = await db.query('SELECT c.titulo, cl.nome AS cliente_nome FROM criativos c JOIN clientes cl ON cl.id = c.cliente_id WHERE c.id = $1', [id]);
                if (info.rows.length > 0 && mailer && mailer.enviarEmailAgencia) {
                    const { titulo, cliente_nome } = info.rows[0];
                    mailer.enviarEmailAgencia('✅ Criativo Aprovado', `<p>O cliente <strong>${cliente_nome}</strong> aprovou o criativo: <strong>"${titulo}"</strong>.</p>`).catch(() => {});
                }
            } catch (e) {}
        } catch (error) {
            console.error("Erro ao aprovar criativo:", error.message);
            if (!res.headersSent) res.status(500).json({ error: 'ERRO NO BANCO: ' + error.message });
        }
    });

    app.post('/api/portal/criativos/:id/recusar', verificarToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { feedback_cliente } = req.body;
            if (!feedback_cliente) return res.status(400).json({ error: 'O feedback é obrigatório.' });

            await db.query("UPDATE criativos SET status = 'recusado', feedback = $1 WHERE id = $2", [feedback_cliente, id]);
            res.json({ message: 'Alteração solicitada com sucesso!' });

            try {
                const info = await db.query('SELECT c.titulo, cl.nome AS cliente_nome FROM criativos c JOIN clientes cl ON cl.id = c.cliente_id WHERE c.id = $1', [id]);
                if (info.rows.length > 0 && mailer && mailer.enviarEmailAgencia) {
                    const { titulo, cliente_nome } = info.rows[0];
                    mailer.enviarEmailAgencia('❌ Criativo Recusado', `<p>O cliente <strong>${cliente_nome}</strong> solicitou alterações no criativo: <strong>"${titulo}"</strong>.</p>`).catch(() => {});
                }
            } catch (e) {}
        } catch (error) {
            console.error("Erro ao recusar criativo:", error.message);
            if (!res.headersSent) res.status(500).json({ error: 'ERRO NO BANCO: ' + error.message });
        }
    });

    // ==========================================
    // BRIEFING
    // ==========================================
    app.get('/api/portal/briefing', verificarToken, async (req, res) => {
        try {
            const u = req.user || req.usuario || req.cliente || {};
            const clienteId = u.id || u.cliente_id || u.sub;
            const result = await db.query('SELECT * FROM briefings WHERE cliente_id = $1', [clienteId]);
            res.json(result.rows[0] || {});
        } catch (error) {
            console.error("Erro ao buscar briefing:", error.message);
            res.status(500).json({ error: 'Erro ao buscar briefing.' });
        }
    });

    app.post('/api/portal/briefing', verificarToken, async (req, res) => {
        try {
            const u = req.user || req.usuario || req.cliente || {};
            const clienteId = u.id || u.cliente_id || u.sub;
            const { empresa, segmento, publico_alvo, concorrentes, diferenciais, identidade_visual, redes_sociais, site } = req.body;

            console.log("🔥 Recebendo dados do briefing para o cliente:", clienteId);

            const existe = await db.query('SELECT id FROM briefings WHERE cliente_id = $1', [clienteId]);

            if (existe.rows.length > 0) {
                await db.query(`
                    UPDATE briefings SET 
                        empresa = $1, segmento = $2, publico_alvo = $3, concorrentes = $4, 
                        diferenciais = $5, identidade_visual = $6, redes_sociais = $7, site = $8 
                    WHERE cliente_id = $9
                `, [empresa || '', segmento || '', publico_alvo || '', concorrentes || '', diferenciais || '', identidade_visual || '', redes_sociais || '', site || '', clienteId]);
                console.log("✅ Briefing atualizado no banco!");
            } else {
                await db.query(`
                    INSERT INTO briefings (cliente_id, empresa, segmento, publico_alvo, concorrentes, diferenciais, identidade_visual, redes_sociais, site) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [clienteId, empresa || '', segmento || '', publico_alvo || '', concorrentes || '', diferenciais || '', identidade_visual || '', redes_sociais || '', site || '']);
                console.log("✅ Briefing criado no banco!");
            }

            res.json({ message: 'Briefing salvo com sucesso!' });
        } catch (error) {
            console.error("❌ ERRO AO SALVAR BRIEFING:", error.message);
            res.status(500).json({ error: 'Erro no banco: ' + error.message });
        }
    });

    // ==========================================
    // RELATÓRIO PDF
    // ==========================================
    app.get('/api/portal/relatorio', verificarToken, async (req, res) => {
        try {
            const u = req.user || req.usuario || req.cliente || {};
            const isCliente = u.tipo !== 'admin' && u.role !== 'admin';
            const clienteId = u.id || u.cliente_id || u.sub;
            
            const queryCliente = isCliente ? `WHERE id = ${clienteId}` : `ORDER BY id LIMIT 1`;
            const infoCliente = await db.query(`SELECT nome, email FROM clientes ${queryCliente}`);
            if (infoCliente.rows.length === 0) return res.status(404).json({ error: 'Nenhum cliente encontrado.' });
            const cliente = infoCliente.rows[0];
            const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 60, right: 60 } });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="relatorio.pdf"`);
            doc.pipe(res);
            doc.fontSize(24).fillColor('#f97316').text('Reverse Marketing', { align: 'center' });
            doc.fontSize(18).text(`Relatório de ${cliente.nome}`, { align: 'center' });
            doc.end();
        } catch (error) {
            if (!res.headersSent) res.status(500).json({ error: 'Erro ao gerar relatório.' });
        }
    });
};