// rotas_atividades.js
module.exports = function(app, db, verificarToken) {

    // ============================================================
    // Helpers
    // ============================================================
    function validarTipo(tipo) {
        return ['ligacao', 'reuniao', 'email', 'whatsapp', 'visita', 'tarefa', 'lembrete'].includes(tipo);
    }
    function validarStatus(s) {
        return ['pendente', 'concluida', 'cancelada'].includes(s);
    }
    function validarPrioridade(p) {
        return ['baixa', 'media', 'alta'].includes(p);
    }

    // ============================================================
    // GET /api/atividades — lista com filtros
    // ============================================================
    app.get('/api/atividades', verificarToken, async (req, res) => {
        try {
            const { cliente_id, lead_id, status, tipo, de, ate, limite } = req.query;
            const condicoes = [];
            const params = [];
            let i = 1;

            if (cliente_id) { condicoes.push(`a.cliente_id = $${i++}`); params.push(cliente_id); }
            if (lead_id)    { condicoes.push(`a.lead_id = $${i++}`);    params.push(lead_id); }
            if (status)     { condicoes.push(`a.status = $${i++}`);     params.push(status); }
            if (tipo)       { condicoes.push(`a.tipo = $${i++}`);       params.push(tipo); }
            if (de)         { condicoes.push(`a.data_hora >= $${i++}`); params.push(de); }
            if (ate)        { condicoes.push(`a.data_hora <= $${i++}`); params.push(ate); }

            const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
            const limitSql = limite ? `LIMIT ${parseInt(limite)}` : 'LIMIT 500';

            const result = await db.query(
                `SELECT a.*, c.nome AS cliente_nome, l.nome AS lead_nome
                   FROM atividades a
                   LEFT JOIN clientes c ON c.id = a.cliente_id
                   LEFT JOIN leads l    ON l.id = a.lead_id
                   ${where}
                   ORDER BY a.data_hora DESC
                   ${limitSql}`,
                params
            );
            res.json(result.rows);
        } catch (err) {
            console.error('=== ERRO GET /api/atividades ===', err);
            res.status(500).json({ erro: 'Erro ao listar atividades', detalhe: err.message });
        }
    });

    // ============================================================
    // GET /api/atividades/hoje — do dia + atrasadas
    // ============================================================
    app.get('/api/atividades/hoje', verificarToken, async (req, res) => {
        try {
            const hoje = await db.query(`
                SELECT a.*, c.nome AS cliente_nome, l.nome AS lead_nome
                  FROM atividades a
                  LEFT JOIN clientes c ON c.id = a.cliente_id
                  LEFT JOIN leads l    ON l.id = a.lead_id
                 WHERE a.status = 'pendente'
                   AND a.data_hora::date = CURRENT_DATE
                 ORDER BY a.data_hora ASC
            `);
            const atrasadas = await db.query(`
                SELECT a.*, c.nome AS cliente_nome, l.nome AS lead_nome
                  FROM atividades a
                  LEFT JOIN clientes c ON c.id = a.cliente_id
                  LEFT JOIN leads l    ON l.id = a.lead_id
                 WHERE a.status = 'pendente'
                   AND a.data_hora::date < CURRENT_DATE
                 ORDER BY a.data_hora ASC
            `);
            res.json({ hoje: hoje.rows, atrasadas: atrasadas.rows });
        } catch (err) {
            console.error('=== ERRO GET /api/atividades/hoje ===', err);
            res.status(500).json({ erro: 'Erro ao buscar atividades do dia', detalhe: err.message });
        }
    });

    // ============================================================
    // GET /api/atividades/:id
    // ============================================================
    app.get('/api/atividades/:id', verificarToken, async (req, res) => {
        try {
            const result = await db.query(
                `SELECT a.*, c.nome AS cliente_nome, l.nome AS lead_nome
                   FROM atividades a
                   LEFT JOIN clientes c ON c.id = a.cliente_id
                   LEFT JOIN leads l    ON l.id = a.lead_id
                  WHERE a.id = $1`,
                [req.params.id]
            );
            if (result.rows.length === 0) return res.status(404).json({ erro: 'Atividade não encontrada' });
            res.json(result.rows[0]);
        } catch (err) {
            console.error('=== ERRO GET /api/atividades/:id ===', err);
            res.status(500).json({ erro: 'Erro ao buscar atividade', detalhe: err.message });
        }
    });

    // ============================================================
    // POST /api/atividades
    // ============================================================
    app.post('/api/atividades', verificarToken, async (req, res) => {
        try {
            const {
                cliente_id = null,
                lead_id = null,
                tipo,
                titulo,
                descricao = null,
                data_hora,
                prioridade = 'media'
            } = req.body;

            if (!cliente_id && !lead_id) return res.status(400).json({ erro: 'Informe cliente_id ou lead_id' });
            if (!tipo || !validarTipo(tipo))   return res.status(400).json({ erro: 'Tipo inválido' });
            if (!titulo || titulo.trim().length < 2) return res.status(400).json({ erro: 'Título obrigatório (mín. 2 caracteres)' });
            if (!data_hora)                    return res.status(400).json({ erro: 'data_hora obrigatória' });
            if (!validarPrioridade(prioridade)) return res.status(400).json({ erro: 'Prioridade inválida' });

            const result = await db.query(
                `INSERT INTO atividades
                    (cliente_id, lead_id, tipo, titulo, descricao, data_hora, prioridade, criado_por)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'admin')
                 RETURNING *`,
                [cliente_id, lead_id, tipo, titulo.trim(), descricao, data_hora, prioridade]
            );
            console.log(`📅 Atividade #${result.rows[0].id} criada: ${titulo}`);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('=== ERRO POST /api/atividades ===', err);
            res.status(500).json({ erro: 'Erro ao criar atividade', detalhe: err.message });
        }
    });

    // ============================================================
    // PUT /api/atividades/:id
    // ============================================================
    app.put('/api/atividades/:id', verificarToken, async (req, res) => {
        try {
            const { tipo, titulo, descricao, data_hora, prioridade, status } = req.body;

            const atual = await db.query('SELECT * FROM atividades WHERE id = $1', [req.params.id]);
            if (atual.rows.length === 0) return res.status(404).json({ erro: 'Atividade não encontrada' });

            if (tipo && !validarTipo(tipo))                return res.status(400).json({ erro: 'Tipo inválido' });
            if (prioridade && !validarPrioridade(prioridade)) return res.status(400).json({ erro: 'Prioridade inválida' });
            if (status && !validarStatus(status))          return res.status(400).json({ erro: 'Status inválido' });

            const result = await db.query(
                `UPDATE atividades SET
                    tipo       = COALESCE($1, tipo),
                    titulo     = COALESCE($2, titulo),
                    descricao  = COALESCE($3, descricao),
                    data_hora  = COALESCE($4, data_hora),
                    prioridade = COALESCE($5, prioridade),
                    status     = COALESCE($6, status),
                    concluida_em = CASE
                        WHEN $6 = 'concluida' AND concluida_em IS NULL THEN NOW()
                        WHEN $6 IS NOT NULL AND $6 <> 'concluida' THEN NULL
                        ELSE concluida_em
                    END
                 WHERE id = $7
                 RETURNING *`,
                [tipo || null, titulo || null, descricao || null, data_hora || null, prioridade || null, status || null, req.params.id]
            );
            res.json(result.rows[0]);
        } catch (err) {
            console.error('=== ERRO PUT /api/atividades/:id ===', err);
            res.status(500).json({ erro: 'Erro ao atualizar atividade', detalhe: err.message });
        }
    });

    // ============================================================
    // PATCH /api/atividades/:id/concluir
    // ============================================================
    app.patch('/api/atividades/:id/concluir', verificarToken, async (req, res) => {
        try {
            const result = await db.query(
                `UPDATE atividades
                    SET status = 'concluida', concluida_em = NOW()
                  WHERE id = $1
                  RETURNING *`,
                [req.params.id]
            );
            if (result.rows.length === 0) return res.status(404).json({ erro: 'Atividade não encontrada' });
            res.json(result.rows[0]);
        } catch (err) {
            console.error('=== ERRO PATCH /api/atividades/:id/concluir ===', err);
            res.status(500).json({ erro: 'Erro ao concluir atividade', detalhe: err.message });
        }
    });

    // ============================================================
    // DELETE /api/atividades/:id
    // ============================================================
    app.delete('/api/atividades/:id', verificarToken, async (req, res) => {
        try {
            const result = await db.query('DELETE FROM atividades WHERE id = $1 RETURNING id', [req.params.id]);
            if (result.rows.length === 0) return res.status(404).json({ erro: 'Atividade não encontrada' });
            res.json({ ok: true, id: result.rows[0].id });
        } catch (err) {
            console.error('=== ERRO DELETE /api/atividades/:id ===', err);
            res.status(500).json({ erro: 'Erro ao excluir atividade', detalhe: err.message });
        }
    });

    // ============================================================
    // GET /api/timeline/lead/:lead_id — agrega TUDO do Lead
    // (Deve vir ANTES de /api/timeline/:cliente_id)
    // ============================================================
    app.get('/api/timeline/lead/:lead_id', verificarToken, async (req, res) => {
        try {
            const leadId = req.params.lead_id;

            const lead = await db.query('SELECT id, nome, email, telefone FROM leads WHERE id = $1', [leadId]);
            if (lead.rows.length === 0) return res.status(404).json({ erro: 'Lead não encontrado' });

            const eventos = [];

            // ATIVIDADES
            try {
                const r = await db.query(
                    `SELECT id, tipo AS sub, titulo, descricao, data_hora, status, prioridade
                       FROM atividades WHERE lead_id = $1`, [leadId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'atividade', subtipo: x.sub, data: x.data_hora,
                    titulo: x.titulo, descricao: x.descricao, status: x.status,
                    meta: { prioridade: x.prioridade, id: x.id }
                }));
            } catch(e) { console.warn('timeline lead atividades:', e.message); }

            // TAREFAS
            try {
                const r = await db.query(
                    `SELECT id, titulo, descricao, data_criacao, concluida, criado_por
                       FROM tarefas WHERE lead_id = $1`, [leadId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'tarefa',
                    subtipo: x.criado_por === 'cliente' ? 'solicitada pelo cliente' : 'criada pela agência',
                    data: x.data_criacao, titulo: x.titulo, descricao: x.descricao,
                    status: x.concluida ? 'concluida' : 'pendente',
                    meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline lead tarefas:', e.message); }

            // PROPOSTAS (por nome do lead, se houver)
            try {
                const r = await db.query(
                    `SELECT id, valor_total, data_criacao, status_aceite, aceite_em, recusa_motivo
                       FROM propostas WHERE cliente_nome = $1`, [lead.rows[0].nome]
                );
                r.rows.forEach(x => {
                    eventos.push({
                        tipo: 'proposta', subtipo: 'criada', data: x.data_criacao,
                        titulo: 'Proposta comercial gerada',
                        descricao: `Valor: R$ ${Number(x.valor_total || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`,
                        status: x.status_aceite, meta: { id: x.id }
                    });
                    if (x.status_aceite === 'aceita' && x.aceite_em) {
                        eventos.push({
                            tipo: 'proposta', subtipo: 'aceita', data: x.aceite_em,
                            titulo: '✅ Proposta aceita', descricao: null,
                            status: 'aceita', meta: { id: x.id }
                        });
                    } else if (x.status_aceite === 'recusada') {
                        eventos.push({
                            tipo: 'proposta', subtipo: 'recusada', data: x.data_criacao,
                            titulo: '❌ Proposta recusada', descricao: x.recusa_motivo,
                            status: 'recusada', meta: { id: x.id }
                        });
                    }
                });
            } catch(e) { console.warn('timeline lead propostas:', e.message); }

            // COMENTÁRIOS
            try {
                const r = await db.query(
                    `SELECT c.id, c.mensagem, c.usuario_tipo, c.data_criacao
                       FROM comentarios c
                       JOIN tarefas t ON t.id = c.tarefa_id
                      WHERE t.lead_id = $1`, [leadId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'comentario', subtipo: x.usuario_tipo, data: x.data_criacao,
                    titulo: `💬 ${x.usuario_tipo === 'admin' ? 'Agência' : 'Cliente'} comentou`,
                    descricao: x.mensagem, status: 'ok', meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline lead comentarios:', e.message); }

            // CRIAÇÃO DO PRÓPRIO LEAD (evento inicial)
            try {
                const r = await db.query(
                    `SELECT id, data_criacao, origem FROM leads WHERE id = $1`, [leadId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'mapeamento', subtipo: 'lead', data: x.data_criacao,
                    titulo: '🎯 Lead capturado',
                    descricao: `Origem: ${x.origem || 'Desconhecida'}`,
                    status: 'ok', meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline lead criacao:', e.message); }

            // ORDENA
            eventos.sort((a, b) => {
                const da = a.data ? new Date(a.data).getTime() : 0;
                const db_ = b.data ? new Date(b.data).getTime() : 0;
                return db_ - da;
            });

            res.json({
                cliente: { id: lead.rows[0].id, nome: lead.rows[0].nome, email: lead.rows[0].email },
                is_lead: true,
                total: eventos.length,
                eventos
            });

        } catch (err) {
            console.error('=== ERRO GET /api/timeline/lead/:lead_id ===', err);
            res.status(500).json({ erro: 'Erro ao carregar timeline do lead', detalhe: err.message });
        }
    });

    // ============================================================
    // GET /api/timeline/:cliente_id — agrega TUDO do cliente
    // ============================================================
    app.get('/api/timeline/:cliente_id', verificarToken, async (req, res) => {
        try {
            const clienteId = req.params.cliente_id;

            const cli = await db.query('SELECT id, nome, email FROM clientes WHERE id = $1', [clienteId]);
            if (cli.rows.length === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });

            const eventos = [];

            // ATIVIDADES
            try {
                const r = await db.query(
                    `SELECT id, tipo AS sub, titulo, descricao, data_hora, status, prioridade
                       FROM atividades WHERE cliente_id = $1`, [clienteId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'atividade', subtipo: x.sub, data: x.data_hora,
                    titulo: x.titulo, descricao: x.descricao, status: x.status,
                    meta: { prioridade: x.prioridade, id: x.id }
                }));
            } catch(e) { console.warn('timeline atividades:', e.message); }

            // TAREFAS
            try {
                const r = await db.query(
                    `SELECT id, titulo, descricao, data_criacao, concluida, criado_por
                       FROM tarefas WHERE cliente_id = $1`, [clienteId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'tarefa',
                    subtipo: x.criado_por === 'cliente' ? 'solicitada pelo cliente' : 'criada pela agência',
                    data: x.data_criacao, titulo: x.titulo, descricao: x.descricao,
                    status: x.concluida ? 'concluida' : 'pendente',
                    meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline tarefas:', e.message); }

            // CRIATIVOS
            try {
                const r = await db.query(
                    `SELECT id, titulo, descricao, data_criacao, status, feedback_cliente
                       FROM criativos WHERE cliente_id = $1`, [clienteId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'criativo', subtipo: x.status || 'enviado',
                    data: x.data_criacao, titulo: x.titulo || 'Criativo',
                    descricao: x.feedback_cliente || x.descricao, status: x.status,
                    meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline criativos:', e.message); }

            // POSTS
            try {
                const r = await db.query(
                    `SELECT id, titulo, legenda, data_publicacao, status, feedback_cliente
                       FROM posts WHERE cliente_id = $1`, [clienteId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'post', subtipo: x.status || 'agendado',
                    data: x.data_publicacao, titulo: x.titulo || 'Post agendado',
                    descricao: x.feedback_cliente || x.legenda, status: x.status,
                    meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline posts:', e.message); }

            // PROPOSTAS
            try {
                const r = await db.query(
                    `SELECT id, cliente_nome, valor_total, data_criacao, status_aceite, aceite_em, recusa_motivo
                       FROM propostas WHERE cliente_id = $1 OR cliente_nome = $2`, [clienteId, cli.rows[0].nome]
                );
                r.rows.forEach(x => {
                    eventos.push({
                        tipo: 'proposta', subtipo: 'criada', data: x.data_criacao,
                        titulo: 'Proposta comercial gerada',
                        descricao: `Valor: R$ ${Number(x.valor_total || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`,
                        status: x.status_aceite, meta: { id: x.id }
                    });
                    if (x.status_aceite === 'aceita' && x.aceite_em) {
                        eventos.push({
                            tipo: 'proposta', subtipo: 'aceita', data: x.aceite_em,
                            titulo: '✅ Proposta aceita pelo cliente', descricao: null,
                            status: 'aceita', meta: { id: x.id }
                        });
                    } else if (x.status_aceite === 'recusada') {
                        eventos.push({
                            tipo: 'proposta', subtipo: 'recusada', data: x.data_criacao,
                            titulo: '❌ Proposta recusada', descricao: x.recusa_motivo,
                            status: 'recusada', meta: { id: x.id }
                        });
                    }
                });
            } catch(e) { console.warn('timeline propostas:', e.message); }

            // FINANCEIRO
            try {
                const r = await db.query(
                    `SELECT 'receita' AS tipo_mov, id, descricao, valor, data FROM receitas WHERE cliente_id = $1
                     UNION ALL
                     SELECT 'despesa' AS tipo_mov, id, descricao, valor, data FROM despesas WHERE cliente_id = $1`,
                    [clienteId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'financeiro', subtipo: x.tipo_mov, data: x.data,
                    titulo: `${x.tipo_mov === 'receita' ? '💰 Receita' : '💸 Despesa'}: ${x.descricao || ''}`,
                    descricao: `R$ ${Number(x.valor || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`,
                    status: x.tipo_mov, meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline financeiro:', e.message); }

            // BRIEFINGS
            try {
                const r = await db.query(
                    `SELECT id, data_criacao FROM briefings WHERE cliente_id = $1`, [clienteId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'briefing', subtipo: 'preenchido', data: x.data_criacao,
                    titulo: '📝 Briefing preenchido', descricao: 'Cliente respondeu o briefing no portal',
                    status: 'ok', meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline briefings:', e.message); }

            // BRANDING
            try {
                const r = await db.query(
                    `SELECT id, data_criacao FROM branding WHERE cliente_id = $1`, [clienteId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'branding', subtipo: 'criado', data: x.data_criacao,
                    titulo: '🎨 Brand Book criado', descricao: 'Identidade visual registrada',
                    status: 'ok', meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline branding:', e.message); }

            // COMENTÁRIOS
            try {
                const r = await db.query(
                    `SELECT c.id, c.mensagem, c.usuario_tipo, c.data_criacao
                       FROM comentarios c
                       JOIN tarefas t ON t.id = c.tarefa_id
                      WHERE t.cliente_id = $1`, [clienteId]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'comentario', subtipo: x.usuario_tipo, data: x.data_criacao,
                    titulo: `💬 ${x.usuario_tipo === 'admin' ? 'Agência' : 'Cliente'} comentou`,
                    descricao: x.mensagem, status: 'ok', meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline comentarios:', e.message); }

            // MAPEAMENTOS
            try {
                const r = await db.query(
                    `SELECT id, data_criacao FROM mapeamentos_clientes WHERE email = $1`, [cli.rows[0].email]
                );
                r.rows.forEach(x => eventos.push({
                    tipo: 'mapeamento', subtipo: 'preenchido', data: x.data_criacao,
                    titulo: '🗺️ Mapeamento preenchido', descricao: 'Formulário de onboarding respondido',
                    status: 'ok', meta: { id: x.id }
                }));
            } catch(e) { console.warn('timeline mapeamento:', e.message); }

            // ORDENA
            eventos.sort((a, b) => {
                const da = a.data ? new Date(a.data).getTime() : 0;
                const db_ = b.data ? new Date(b.data).getTime() : 0;
                return db_ - da;
            });

            res.json({ cliente: cli.rows[0], is_lead: false, total: eventos.length, eventos });

        } catch (err) {
            console.error('=== ERRO GET /api/timeline/:cliente_id ===', err);
            res.status(500).json({ erro: 'Erro ao carregar timeline', detalhe: err.message });
        }
    });
};