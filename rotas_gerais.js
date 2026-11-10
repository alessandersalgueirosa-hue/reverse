const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

module.exports = function(app, db, verificarToken) {
    
    let middlewares;
    try {
        middlewares = require('./middlewares')(db);
    } catch (e) {
        middlewares = { verificarPermissao: () => (req, res, next) => next() };
    }
    
    // ==========================================
    // CONFIGURAÇÃO DE UPLOAD (MULTER)
    // ==========================================
    const pastaPosts = path.join(__dirname, 'public', 'uploads', 'posts');
    const pastaCriativos = path.join(__dirname, 'public', 'uploads', 'criativos');
    
    if (!fs.existsSync(pastaPosts)) fs.mkdirSync(pastaPosts, { recursive: true });
    if (!fs.existsSync(pastaCriativos)) fs.mkdirSync(pastaCriativos, { recursive: true });

    const storagePosts = multer.diskStorage({
        destination: (req, file, cb) => cb(null, pastaPosts),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
    });
    const uploadPost = multer({ storage: storagePosts });

    const storageCriativos = multer.diskStorage({
        destination: (req, file, cb) => cb(null, pastaCriativos),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
    });
    const uploadCriativo = multer({ storage: storageCriativos });

    // ==========================================
    // VALIDAÇÃO DE VALORES MONETÁRIOS
    // ==========================================
    const LIMITE_MAXIMO_VALOR = 10000000;

    function validarValorMonetario(valor, campo = 'valor') {
        const numero = parseFloat(valor);
        if (isNaN(numero)) return { valido: false, error: `O ${campo} precisa ser um número válido.` };
        if (numero < 0) return { valido: false, error: `O ${campo} não pode ser negativo.` };
        if (numero > LIMITE_MAXIMO_VALOR) return { valido: false, error: `O ${campo} excede o limite de R$ 10.000.000,00.` };
        return { valido: true, valor: numero };
    }

    // ==========================================
    // PRODUTOS
    // ==========================================
    app.get('/api/produtos', async (req, res) => { 
        try { const result = await db.query('SELECT * FROM produtos ORDER BY id DESC'); res.json(result.rows); } 
        catch (error) { res.status(500).json({ error: 'Erro ao buscar produtos' }); } 
    });
    app.get('/api/produtos/:id', async (req, res) => { 
        try { const result = await db.query('SELECT * FROM produtos WHERE id = $1', [req.params.id]); if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado.' }); res.json(result.rows[0]); } 
        catch (error) { res.status(500).json({ error: 'Erro ao buscar produto' }); } 
    });
    app.post('/api/produtos', async (req, res) => { 
        try {
            const { nome, descricao, preco, categoria, sku, estoque, status } = req.body; 
            if (!nome || preco === undefined) return res.status(400).json({ error: 'Nome e preço são obrigatórios.' }); 
            const result = await db.query('INSERT INTO produtos (nome, descricao, preco, categoria, sku, estoque, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [nome, descricao || null, preco, categoria || null, sku || null, estoque || 0, status || 'ativo']); 
            res.status(201).json(result.rows[0]); 
        } catch (error) { res.status(500).json({ error: 'Erro ao salvar produto' }); } 
    });
    app.put('/api/produtos/:id', async (req, res) => { 
        try {
            const { nome, descricao, preco, categoria, sku, estoque, status } = req.body; 
            const result = await db.query('UPDATE produtos SET nome = $1, descricao = $2, preco = $3, categoria = $4, sku = $5, estoque = $6, status = $7 WHERE id = $8 RETURNING *', [nome, descricao || null, preco, categoria || null, sku || null, estoque || 0, status || 'ativo', req.params.id]); 
            res.json(result.rows[0]); 
        } catch (error) { res.status(500).json({ error: 'Erro ao atualizar produto' }); } 
    });
    app.delete('/api/produtos/:id', async (req, res) => { 
        try { await db.query('DELETE FROM produtos WHERE id = $1', [req.params.id]); res.json({ message: 'Produto excluído' }); } 
        catch (error) { res.status(500).json({ error: 'Erro ao excluir produto' }); } 
    });

    // ==========================================
    // CAMPANHAS
    // ==========================================
    app.get('/api/campanhas', verificarToken, middlewares.verificarPermissao('pode_ver_campanhas'), async (req, res) => { 
        try { 
            const u = req.user || req.usuario || req.cliente || {};
            const isCliente = u.tipo === 'cliente';
            
            let query;
            let values = [];
            if (isCliente) {
                query = `SELECT c.*, cl.nome AS cliente_nome FROM campanhas c LEFT JOIN clientes cl ON cl.id = c.cliente_id WHERE c.cliente_id = $1 ORDER BY c.id DESC`;
                values = [u.id || u.cliente_id];
            } else {
                query = `SELECT c.*, cl.nome AS cliente_nome FROM campanhas c LEFT JOIN clientes cl ON cl.id = c.cliente_id ORDER BY c.id DESC`;
            }
            const result = await db.query(query, values); 
            res.json(result.rows); 
        } catch (error) { res.json([]); } 
    });
    app.post('/api/campanhas', verificarToken, async (req, res) => { 
        const { nome, descricao, data_inicio, data_fim, orcamento, cliente_id } = req.body; 
        const validacao = validarValorMonetario(orcamento, 'orçamento');
        if (!validacao.valido) return res.status(400).json({ error: validacao.error });
        try { const result = await db.query('INSERT INTO campanhas (nome, descricao, data_inicio, data_fim, orcamento, cliente_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [nome, descricao, data_inicio, data_fim, validacao.valor, cliente_id || null]); res.status(201).json(result.rows[0]); } 
        catch (error) { res.status(500).json({ error: 'Erro ao criar campanha' }); } 
    });
    app.put('/api/campanhas/:id', verificarToken, async (req, res) => { 
        const { nome, descricao, data_inicio, data_fim, orcamento, status, cliente_id } = req.body; 
        const validacao = validarValorMonetario(orcamento, 'orçamento');
        if (!validacao.valido) return res.status(400).json({ error: validacao.error });
        try { await db.query('UPDATE campanhas SET nome = $1, descricao = $2, data_inicio = $3, data_fim = $4, orcamento = $5, status = $6, cliente_id = $7 WHERE id = $8', [nome, descricao, data_inicio, data_fim, validacao.valor, status, cliente_id || null, req.params.id]); res.json({ message: 'Atualizada' }); } 
        catch (error) { res.status(500).json({ error: 'Erro ao atualizar' }); } 
    });
    app.delete('/api/campanhas/:id', verificarToken, async (req, res) => { 
        try { await db.query('DELETE FROM campanhas WHERE id = $1', [req.params.id]); res.json({ message: 'Excluída' }); } 
        catch (error) { res.status(500).json({ error: 'Erro ao excluir' }); } 
    });

    // ==========================================
    // TRÁFEGO PAGO
    // ==========================================
    app.get('/api/trafego-pago', verificarToken, async (req, res) => {
        try {
            const u = req.user || req.usuario || req.cliente || {};
            const isCliente = u.tipo === 'cliente';
            let query;
            let values = [];
            if (isCliente) {
                query = `SELECT t.*, c.nome AS cliente_nome FROM trafego_pago t LEFT JOIN clientes c ON c.id = t.cliente_id WHERE t.cliente_id = $1 ORDER BY t.id DESC`;
                values = [u.id || u.cliente_id];
            } else {
                query = `SELECT t.*, c.nome AS cliente_nome FROM trafego_pago t LEFT JOIN clientes c ON c.id = t.cliente_id ORDER BY t.id DESC`;
            }
            const result = await db.query(query, values);
            res.json(result.rows);
        } catch (error) { res.json([]); }
    });

    app.post('/api/trafego-pago', verificarToken, async (req, res) => {
        try {
            const { cliente_id, plataforma, nome_campanha, objetivo, orcamento_diario, data_inicio, status, investimento_total, impressoes, cliques, conversoes, observacoes } = req.body;
            const query = `
                INSERT INTO trafego_pago 
                (cliente_id, plataforma, nome_campanha, objetivo, orcamento_diario, data_inicio, status, investimento_total, impressoes, cliques, conversoes, observacoes) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
            `;
            const values = [
                cliente_id, plataforma || null, nome_campanha, objetivo || null, 
                parseFloat(orcamento_diario) || 0, data_inicio || null, status || 'Ativa', 
                parseFloat(investimento_total) || 0, parseInt(impressoes) || 0, 
                parseInt(cliques) || 0, parseInt(conversoes) || 0, observacoes || null
            ];
            const result = await db.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (error) { res.status(500).json({ error: 'Erro ao salvar campanha', detalhe: error.message }); }
    });

    app.delete('/api/trafego-pago/:id', verificarToken, async (req, res) => {
        try {
            await db.query('DELETE FROM trafego_pago WHERE id = $1', [req.params.id]);
            res.json({ message: 'Campanha excluída com sucesso.' });
        } catch (error) { res.status(500).json({ error: 'Erro ao excluir campanha' }); }
    });

    // ==========================================
    // FINANCEIRO
    // ==========================================
    app.get('/api/financeiro/dados', verificarToken, middlewares.verificarPermissao('pode_ver_financeiro'), async (req, res) => { 
        try { 
            const campanhas = await db.query(`SELECT c.*, CAST(c.orcamento AS DECIMAL) as orcamento, cl.nome AS cliente_nome FROM campanhas c LEFT JOIN clientes cl ON cl.id = c.cliente_id ORDER BY c.data_inicio DESC`); 
            const receitas = await db.query(`SELECT r.*, CAST(r.valor AS DECIMAL) as valor, cl.nome AS cliente_nome FROM receitas r LEFT JOIN clientes cl ON cl.id = r.cliente_id ORDER BY r.data DESC`); 
            const despesas = await db.query(`SELECT d.*, CAST(d.valor AS DECIMAL) as valor, cl.nome AS cliente_nome FROM despesas d LEFT JOIN clientes cl ON cl.id = d.cliente_id ORDER BY d.data DESC`); 
            res.json({ campanhas: campanhas.rows, receitas: receitas.rows, despesas: despesas.rows }); 
        } catch (error) { res.status(500).json({ error: 'Erro ao buscar financeiro' }); } 
    });
    app.post('/api/receitas', verificarToken, async (req, res) => { 
        const { cliente_id, descricao, valor, data } = req.body; 
        const validacao = validarValorMonetario(valor, 'valor');
        if (!validacao.valido) return res.status(400).json({ error: validacao.error });
        try { const result = await db.query('INSERT INTO receitas (cliente_id, descricao, valor, data) VALUES ($1, $2, $3, $4) RETURNING *', [cliente_id || null, descricao, validacao.valor, data]); res.status(201).json(result.rows[0]); } 
        catch (error) { res.status(500).json({ error: 'Erro ao salvar receita' }); } 
    });
    app.post('/api/despesas', verificarToken, async (req, res) => { 
        const { cliente_id, descricao, valor, data, categoria } = req.body; 
        const validacao = validarValorMonetario(valor, 'valor');
        if (!validacao.valido) return res.status(400).json({ error: validacao.error });
        try { const result = await db.query('INSERT INTO despesas (cliente_id, descricao, valor, data, categoria) VALUES ($1, $2, $3, $4, $5) RETURNING *', [cliente_id || null, descricao, validacao.valor, data, categoria]); res.status(201).json(result.rows[0]); } 
        catch (error) { res.status(500).json({ error: 'Erro ao salvar despesa' }); } 
    });

    // ==========================================
    // INBOUND E OUTBOUND
    // ==========================================
    app.get('/api/inbound', verificarToken, async (req, res) => { 
        try { const result = await db.query(`SELECT i.*, c.nome AS cliente_nome FROM inbound_marketing i LEFT JOIN clientes c ON c.id = i.cliente_id ORDER BY i.data_criacao DESC`); res.json(result.rows); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); } 
    });
    app.post('/api/inbound', verificarToken, async (req, res) => { 
        const { cliente_id, persona, etapa_funil, tipo_conteudo, titulo, descricao, palavras_chave, status, link } = req.body; 
        try { const result = await db.query('INSERT INTO inbound_marketing (cliente_id, persona, etapa_funil, tipo_conteudo, titulo, descricao, palavras_chave, status, link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [cliente_id, persona, etapa_funil, tipo_conteudo, titulo, descricao, palavras_chave, status, link]); res.status(201).json(result.rows[0]); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); } 
    });
    app.delete('/api/inbound/:id', verificarToken, async (req, res) => {
        try { await db.query('DELETE FROM inbound_marketing WHERE id = $1', [req.params.id]); res.json({ message: 'Excluída' }); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); }
    });
    app.get('/api/outbound', verificarToken, async (req, res) => { 
        try { const result = await db.query(`SELECT o.*, c.nome AS cliente_nome, p.nome AS prospect_nome FROM outbound_marketing o LEFT JOIN clientes c ON c.id = o.cliente_id LEFT JOIN prospects p ON p.id = o.prospect_id ORDER BY o.data_criacao DESC`); res.json(result.rows); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); } 
    });
    app.post('/api/outbound', verificarToken, async (req, res) => { 
        const { cliente_id, prospect_id, canal, mensagem, status, data_acao, observacoes } = req.body; 
        try { const result = await db.query('INSERT INTO outbound_marketing (cliente_id, prospect_id, canal, mensagem, status, data_acao, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [cliente_id, prospect_id, canal, mensagem, status, data_acao, observacoes]); res.status(201).json(result.rows[0]); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); } 
    });

    // ==========================================
    // PROSPECTS
    // ==========================================
    app.get('/api/prospects', verificarToken, async (req, res) => { 
        try { const result = await db.query('SELECT * FROM prospects ORDER BY data_criacao DESC'); res.json(result.rows); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); } 
    });
    app.post('/api/prospects', verificarToken, async (req, res) => { 
        const { nome, email, telefone, empresa, cargo, origem, status, observacoes } = req.body; 
        if (!nome) return res.status(400).json({ error: 'O nome é obrigatório.' }); 
        try { const result = await db.query('INSERT INTO prospects (nome, email, telefone, empresa, cargo, origem, status, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [nome, email || null, telefone || null, empresa || null, cargo || null, origem || null, status || 'novo', observacoes || null]); res.status(201).json(result.rows[0]); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); } 
    });

    // ==========================================
    // ROTA EXCLUSIVA PARA O DASHBOARD DE MÉTRICAS DO SISTEMA
    // ==========================================
    app.get('/api/metricas_sistema', verificarToken, async (req, res) => {
        console.log("🚨 [MÉTRICAS SISTEMA] Rota acessada!");
        try {
            const clientes = await db.query('SELECT COUNT(*) AS total FROM clientes');
            const prospects = await db.query('SELECT COUNT(*) AS total FROM prospects');
            const leads = await db.query('SELECT COUNT(*) AS total FROM leads');
            const campanhas = await db.query('SELECT COUNT(*) AS total FROM campanhas');
            const tarefasPendentes = await db.query('SELECT COUNT(*) AS total FROM tarefas WHERE concluida = false');
            
            const funil = await db.query(`
                SELECT COALESCE(status, 'Novo') AS etapa, COUNT(*) AS total 
                FROM leads 
                GROUP BY COALESCE(status, 'Novo') 
                ORDER BY total DESC
            `);

            const origem = await db.query(`
                SELECT COALESCE(origem, 'Não informado') AS origem, COUNT(*) AS total 
                FROM leads 
                GROUP BY COALESCE(origem, 'Não informado') 
                ORDER BY total DESC
            `);

            const statusLeads = await db.query(`
                SELECT COALESCE(status, 'Novo') AS status, COUNT(*) AS total 
                FROM leads 
                GROUP BY COALESCE(status, 'Novo')
            `);

            let pendentes = 0;
            let atendidos = 0;
            statusLeads.rows.forEach(row => {
                if (row.status.toLowerCase() === 'novo' || row.status.toLowerCase() === 'pendente') {
                    pendentes += parseInt(row.total);
                } else {
                    atendidos += parseInt(row.total);
                }
            });

            const payload = {
                totalLeads: parseInt(leads.rows[0].total) || 0,
                pendentes: pendentes,
                atendidos: atendidos,
                totalClientes: parseInt(clientes.rows[0].total) || 0,
                totalProspects: parseInt(prospects.rows[0].total) || 0,
                tarefasPendentes: parseInt(tarefasPendentes.rows[0].total) || 0,
                totalCampanhas: parseInt(campanhas.rows[0].total) || 0,
                funil: funil.rows,
                baseContatos: origem.rows
            };

            console.log("📊 [MÉTRICAS SISTEMA] Enviando dados para o frontend:", JSON.stringify(payload, null, 2));

            res.json(payload);
        } catch (error) {
            console.error("❌ [MÉTRICAS SISTEMA] Erro na rota:", error.message);
            res.status(500).json({ error: 'Erro ao buscar métricas do sistema', detalhe: error.message });
        }
    });

    // ==========================================
    // MÉTRICAS GERAIS (MANTIDA PARA COMPATIBILIDADE)
    // ==========================================
    app.get('/api/metricas', verificarToken, middlewares.verificarPermissao('pode_ver_metricas'), async (req, res) => { 
        try { 
            const u = req.user || req.usuario || req.cliente || {};
            const isAdmin = u.tipo === 'admin' || u.role === 'admin' || !u.id; 

            const filtroLeads = isAdmin ? '' : `WHERE cliente_id = ${u.id}`;
            const filtroCampanhas = isAdmin ? '' : `WHERE c.cliente_id = ${u.id}`;

            const funil = await db.query(`SELECT COALESCE(status, 'novo') AS etapa, COUNT(*) AS total FROM leads ${filtroLeads} GROUP BY COALESCE(status, 'novo') ORDER BY total DESC`); 
            const origem = await db.query(`SELECT COALESCE(origem, 'Não informado') AS origem, COUNT(*) AS total FROM leads ${filtroLeads} GROUP BY origem ORDER BY total DESC`); 
            const campanhas = await db.query(`SELECT c.nome, cl.nome AS cliente_nome, COUNT(l.id) AS total_leads, c.orcamento FROM campanhas c LEFT JOIN leads l ON l.campanha_id = c.id LEFT JOIN clientes cl ON cl.id = c.cliente_id ${filtroCampanhas} GROUP BY c.id, c.nome, cl.nome, c.orcamento ORDER BY total_leads DESC`); 
            const clientesResult = await db.query('SELECT COUNT(*) AS total FROM clientes'); 
            const prospectsResult = await db.query('SELECT COUNT(*) AS total FROM prospects'); 
            
            res.json({ 
                funil: funil.rows, 
                origem: origem.rows, 
                campanhas: campanhas.rows, 
                totalClientes: parseInt(clientesResult.rows[0].total), 
                totalProspects: parseInt(prospectsResult.rows[0].total) 
            }); 
        } catch (error) { 
            res.status(500).json({ error: 'Erro ao buscar métricas' }); 
        } 
    });

    // ==========================================
    // STORYTELLING
    // ==========================================
    app.get('/api/storytelling', verificarToken, async (req, res) => { 
        try { const result = await db.query(`SELECT s.*, c.nome AS cliente_nome FROM storytelling s LEFT JOIN clientes c ON c.id = s.cliente_id ORDER BY s.data_criacao DESC`); res.json(result.rows); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); } 
    });
    app.post('/api/storytelling', verificarToken, async (req, res) => { 
        const { cliente_id, titulo, publico_alvo, dor_principal, solucao, transformacao } = req.body; 
        if (!titulo || !cliente_id) return res.status(400).json({ error: 'Título e Cliente são obrigatórios.' }); 
        try { const result = await db.query('INSERT INTO storytelling (cliente_id, titulo, publico_alvo, dor_principal, solucao, transformacao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [cliente_id, titulo, publico_alvo || null, dor_principal || null, solucao || null, transformacao || null]); res.status(201).json(result.rows[0]); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); } 
    });
    app.delete('/api/storytelling/:id', verificarToken, async (req, res) => { 
        try { await db.query('DELETE FROM storytelling WHERE id = $1', [req.params.id]); res.json({ message: 'Excluída' }); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); } 
    });

    // ==========================================
    // TAREFAS DADOS
    // ==========================================
    app.get('/api/tarefas/dados', verificarToken, async (req, res) => {
        try {
            const clientes = await db.query('SELECT id, nome FROM clientes ORDER BY nome');
            const leads = await db.query('SELECT id, nome FROM leads ORDER BY nome');
            res.json({ clientes: clientes.rows, leads: leads.rows });
        } catch (error) { res.status(500).json({ error: 'Erro' }); }
    });

    // ==========================================
    // BRANDING
    // ==========================================
    app.get('/api/admin/brandings', verificarToken, async (req, res) => {
        try {
            const query = `SELECT b.*, c.nome AS cliente_nome FROM branding b LEFT JOIN clientes c ON c.id = b.cliente_id ORDER BY b.id DESC`;
            const result = await db.query(query);
            res.json(result.rows);
        } catch (error) {
            if (error.message.includes("does not exist")) return res.json([]);
            res.status(500).json({ error: 'Erro ao buscar brandings' });
        }
    });

    app.get('/api/branding/pdf/:cliente_id', verificarToken, async (req, res) => {
        try {
            const { cliente_id } = req.params;
            const query = `SELECT b.*, c.nome AS cliente_nome FROM branding b JOIN clientes c ON c.id = b.cliente_id WHERE b.cliente_id = $1`;
            const result = await db.query(query, [cliente_id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'Brand Book não encontrado.' });
            
            const data = result.rows[0];
            const doc = new PDFDocument({ margin: 50 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=brandbook-${data.cliente_nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
            doc.pipe(res);

            doc.fontSize(24).fillColor('#f97316').text('Brand Book', { align: 'center' });
            doc.fontSize(18).fillColor('#333333').text(data.cliente_nome || 'Cliente', { align: 'center' });
            doc.moveDown(2);

            const addSecao = (titulo, conteudo) => {
                if (!conteudo) return;
                doc.fontSize(14).fillColor('#f97316').text(titulo);
                doc.fontSize(11).fillColor('#444444').text(conteudo, { align: 'justify' });
                doc.moveDown(1.5);
            };

            addSecao('Missão', data.missao);
            addSecao('Visão', data.visao);
            addSecao('Valores', data.valores);
            addSecao('Público-Alvo', data.publico_alvo);
            addSecao('Personalidade', data.personalidade);
            addSecao('Tom de Voz', data.tom_de_voz);

            doc.fontSize(14).fillColor('#f97316').text('Identidade Visual');
            doc.moveDown(0.5);
            if (data.cores_primarias) doc.fontSize(11).fillColor('#444444').text(`Cores Primárias: ${data.cores_primarias}`);
            if (data.cores_secundarias) doc.fontSize(11).fillColor('#444444').text(`Cores Secundárias: ${data.cores_secundarias}`);
            if (data.tipografia_principal) doc.fontSize(11).fillColor('#444444').text(`Tipografia Principal: ${data.tipografia_principal}`);
            if (data.tipografia_secundaria) doc.fontSize(11).fillColor('#444444').text(`Tipografia Secundária: ${data.tipografia_secundaria}`);
            doc.moveDown(1.5);
            addSecao('Referências Visuais', data.referencias_visuais);
            doc.end();
        } catch (error) { res.status(500).json({ error: 'Erro interno ao gerar PDF.' }); }
    });

    app.get('/api/branding/:cliente_id', verificarToken, async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM branding WHERE cliente_id = $1', [req.params.cliente_id]);
            res.json(result.rows[0] || {});
        } catch (error) {
            if (error.message.includes("does not exist")) return res.json({});
            res.status(500).json({ error: 'Erro ao buscar branding' });
        }
    });

    app.post('/api/branding', verificarToken, async (req, res) => {
        try {
            const { cliente_id, missao, visao, valores, publico_alvo, personalidade, tom_de_voz, cores_primarias, cores_secundarias, tipografia_principal, tipografia_secundaria, referencias_visuais } = req.body;
            if (!cliente_id) return res.status(400).json({ error: 'O ID do cliente é obrigatório.' });
            const existe = await db.query('SELECT id FROM branding WHERE cliente_id = $1', [cliente_id]);
            if (existe.rows.length > 0) {
                await db.query(`UPDATE branding SET missao = $1, visao = $2, valores = $3, publico_alvo = $4, personalidade = $5, tom_de_voz = $6, cores_primarias = $7, cores_secundarias = $8, tipografia_principal = $9, tipografia_secundaria = $10, referencias_visuais = $11 WHERE cliente_id = $12`, [missao || '', visao || '', valores || '', publico_alvo || '', personalidade || '', tom_de_voz || '', cores_primarias || '', cores_secundarias || '', tipografia_principal || '', tipografia_secundaria || '', referencias_visuais || '', cliente_id]);
            } else {
                await db.query(`INSERT INTO branding (cliente_id, missao, visao, valores, publico_alvo, personalidade, tom_de_voz, cores_primarias, cores_secundarias, tipografia_principal, tipografia_secundaria, referencias_visuais) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [cliente_id, missao || '', visao || '', valores || '', publico_alvo || '', personalidade || '', tom_de_voz || '', cores_primarias || '', cores_secundarias || '', tipografia_principal || '', tipografia_secundaria || '', referencias_visuais || '']);
            }
            res.status(201).json({ message: 'Brand Book salvo com sucesso!' });
        } catch (error) { res.status(500).json({ error: 'Erro interno ao salvar branding' }); }
    });

    // ==========================================
    // BASE DE CONHECIMENTO
    // ==========================================
    app.get('/api/conhecimento', async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM conhecimento ORDER BY data_criacao DESC');
            res.json(result.rows);
        } catch (error) {
            if (error.message.includes("does not exist")) return res.json([]);
            res.status(500).json({ error: 'Erro ao buscar artigos' });
        }
    });
    app.post('/api/conhecimento', async (req, res) => {
        const { titulo, categoria, conteudo } = req.body;
        try {
            const result = await db.query('INSERT INTO conhecimento (titulo, categoria, conteudo, autor) VALUES ($1, $2, $3, $4) RETURNING *', [titulo, categoria, conteudo, 'Admin']);
            res.status(201).json(result.rows[0]);
        } catch (error) { res.status(500).json({ error: 'Erro ao criar artigo' }); }
    });
    app.delete('/api/conhecimento/:id', verificarToken, async (req, res) => {
        try { await db.query('DELETE FROM conhecimento WHERE id = $1', [req.params.id]); res.json({ message: 'Artigo excluído' }); } 
        catch (error) { res.status(500).json({ error: 'Erro ao excluir artigo' }); }
    });

    // ==========================================
    // ADMIN: BRIEFINGS
    // ==========================================
    app.get('/api/admin/briefings', verificarToken, async (req, res) => {
        try {
            const query = `SELECT b.*, c.nome AS cliente_nome, c.email AS cliente_email FROM briefings b LEFT JOIN clientes c ON c.id = b.cliente_id ORDER BY b.id DESC`;
            const result = await db.query(query);
            res.json(result.rows);
        } catch (error) {
            if (error.message.includes("does not exist")) return res.json([]);
            res.status(500).json({ error: 'Erro ao buscar briefings' });
        }
    });

    // ==========================================
    // CRIATIVOS
    // ==========================================
    
    // ROTA PARA O ADMIN LISTAR TODOS OS CRIATIVOS
    app.get('/api/admin/criativos', verificarToken, async (req, res) => {
        try {
            const query = `
                SELECT c.*, c.feedback AS feedback_cliente, cl.nome AS cliente_nome 
                FROM criativos c 
                LEFT JOIN clientes cl ON cl.id = c.cliente_id 
                ORDER BY c.data_criacao DESC
            `;
            const result = await db.query(query);
            res.json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar criativos para o admin:", error.message);
            res.status(500).json({ error: 'Erro ao buscar criativos' });
        }
    });

    // CRIAR CRIATIVO (COM UPLOAD DE ARQUIVO)
    app.post('/api/criativos', verificarToken, uploadCriativo.single('arquivo'), async (req, res) => {
        try {
            const { cliente_id, titulo, url_arquivo } = req.body;
            
            let urlFinal = url_arquivo;
            if (req.file) {
                urlFinal = '/uploads/criativos/' + req.file.filename;
            }

            if (!cliente_id || !titulo || !urlFinal) {
                return res.status(400).json({ error: 'Preencha todos os campos.' });
            }

            const result = await db.query(`INSERT INTO criativos (cliente_id, titulo, url_arquivo, status) VALUES ($1, $2, $3, 'pendente') RETURNING *`, [cliente_id, titulo, urlFinal]);

            // === GATILHO DE NOTIFICAÇÃO PARA O CRIATIVO ===
            if (cliente_id) {
                db.query(
                    "INSERT INTO notificacoes (cliente_id, titulo, mensagem, link) VALUES ($1, $2, $3, $4)",
                    [cliente_id, 'Novo Criativo Disponível', 'Uma nova peça está aguardando sua aprovação no portal.', '/portal_cliente.html']
                ).catch(err => console.error("Erro ao notificar criativo:", err.message));
            }
            // ===============================================

            res.status(201).json(result.rows[0]);
        } catch (error) { 
            console.error("Erro ao criar criativo:", error.message);
            res.status(500).json({ error: 'Erro no banco: ' + error.message }); 
        }
    });

    // ==========================================
    // PLANEJAMENTO
    // ==========================================
    app.get('/api/planejamento', verificarToken, async (req, res) => {
        try {
            const query = `SELECT p.*, cl.nome AS cliente_nome, c.nome AS campanha_nome FROM planejamento p LEFT JOIN clientes cl ON cl.id = p.cliente_id LEFT JOIN campanhas c ON c.id = p.campanha_id ORDER BY p.id DESC`;
            const result = await db.query(query);
            res.json(result.rows);
        } catch (error) { res.json([]); }
    });
    app.post('/api/planejamento', verificarToken, async (req, res) => {
        try {
            const { cliente_id, campanha_id, orcamento, meta_roas, responsavel } = req.body;
            const query = `INSERT INTO planejamento (cliente_id, campanha_id, orcamento, meta_roas, responsavel) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
            const result = await db.query(query, [cliente_id, campanha_id, orcamento, meta_roas, responsavel]);
            res.status(201).json(result.rows[0]);
        } catch (error) { res.status(500).json({ error: 'Erro ao salvar planejamento' }); }
    });
    app.delete('/api/planejamento/:id', verificarToken, async (req, res) => {
        try { await db.query('DELETE FROM planejamento WHERE id = $1', [req.params.id]); res.json({ message: 'Excluído' }); } 
        catch (error) { res.status(500).json({ error: 'Erro' }); }
    });

    // ==========================================
    // CALENDÁRIO EDITORIAL (POSTS) - COM UPLOAD
    // ==========================================
    app.get('/api/acoes-sociais', verificarToken, async (req, res) => { 
        try { 
            const resultado = await db.query(`SELECT p.*, p.url_midia AS link, cl.nome AS cliente_nome FROM posts p LEFT JOIN clientes cl ON cl.id = p.cliente_id ORDER BY p.data_publicacao DESC NULLS LAST, p.data_criacao DESC`); 
            res.json(resultado.rows); 
        } catch (erro) { res.status(500).json({ error: 'Erro interno ao buscar posts' }); } 
    });

    app.post('/api/acoes-sociais', verificarToken, uploadPost.single('arquivo'), async (req, res) => { 
        const cliente_id = req.body.cliente_id;
        const titulo = req.body.titulo;
        const plataforma = req.body.plataforma || req.body.tipo; 
        const conteudo = req.body.conteudo || req.body.descricao;
        const data_publicacao = req.body.data_publicacao;
        const status = req.body.status || 'pendente';
        
        let url_midia = req.body.url_midia || req.body.link || req.body.imagem_url;
        if (req.file) {
            url_midia = '/uploads/posts/' + req.file.filename;
        }

        if (!cliente_id || !titulo) return res.status(400).json({ error: 'Cliente e título são obrigatórios.' }); 

        try { 
            const query = `INSERT INTO posts (cliente_id, plataforma, titulo, conteudo, data_publicacao, status, url_midia) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
            const values = [cliente_id, plataforma || 'Instagram', titulo, conteudo || null, data_publicacao || null, status, url_midia || null];
            const result = await db.query(query, values);

            // === GATILHO DE NOTIFICAÇÃO PARA O POST ===
            if (cliente_id) {
                db.query(
                    "INSERT INTO notificacoes (cliente_id, titulo, mensagem, link) VALUES ($1, $2, $3, $4)",
                    [cliente_id, 'Novo Post Disponível', 'Um novo post foi agendado e precisa da sua aprovação.', '/portal_cliente.html']
                ).catch(err => console.error("Erro ao notificar post:", err.message));
            }
            // ===========================================

            res.status(201).json(result.rows[0]); 
        } catch (error) { 
            console.error("Erro ao criar post:", error.message);
            res.status(500).json({ error: 'Erro no banco: ' + error.message }); 
        } 
    });

    app.delete('/api/acoes-sociais/:id', verificarToken, async (req, res) => { 
        try { await db.query('DELETE FROM posts WHERE id = $1', [req.params.id]); res.json({ message: 'Post excluído com sucesso.' }); } 
        catch (erro) { res.status(500).json({ error: 'Erro interno ao excluir post' }); } 
    });

    // ==========================================
    // DISPARO DE E-MAIL
    // ==========================================
    app.post('/api/enviar-email', verificarToken, async (req, res) => {
        const { destinatario, assunto, corpo } = req.body;
        if (!destinatario || !assunto || !corpo) return res.status(400).json({ error: 'Destinatário, assunto e corpo são obrigatórios.' });

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: 'reverse.mkt.dgt@gmail.com', pass: 'woox ryzd ndki ijwh' }
            });
            await transporter.sendMail({
                from: '"Reverse Marketing" <reverse.mkt.dgt@gmail.com>',
                to: destinatario, subject: assunto, html: corpo 
            });
            res.json({ message: 'E-mail enviado com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao enviar e-mail. Verifique as credenciais do Gmail.' });
        }
    });

    // ==========================================
    // DASHBOARD, BACKUP, ETC
    // ==========================================
    app.get('/api/dashboard/tarefas-atrasadas', verificarToken, async (req, res) => {
        try {
            const query = `SELECT t.*, c.nome AS cliente_nome FROM tarefas t LEFT JOIN clientes c ON c.id = t.cliente_id WHERE t.concluida = false AND t.data_vencimento < CURRENT_DATE ORDER BY t.data_vencimento ASC`;
            const result = await db.query(query);
            res.json(result.rows);
        } catch (error) { res.status(500).json({ error: 'Erro' }); }
    });

    app.get('/api/dashboard/graficos', verificarToken, async (req, res) => {
        try {
            const queryFaturamento = `SELECT TO_CHAR(data, 'MM/YYYY') AS mes, SUM(valor) AS total FROM receitas WHERE data >= CURRENT_DATE - INTERVAL '6 months' GROUP BY TO_CHAR(data, 'MM/YYYY'), DATE_TRUNC('month', data) ORDER BY DATE_TRUNC('month', data) ASC`;
            const resultFaturamento = await db.query(queryFaturamento);
            const queryLeads = `SELECT COALESCE(status, 'Novo') AS status, COUNT(*) AS total FROM leads GROUP BY COALESCE(status, 'Novo') ORDER BY total DESC`;
            const resultLeads = await db.query(queryLeads);
            const queryClientes = `SELECT TO_CHAR(data_criacao, 'MM/YYYY') AS mes, COUNT(*) AS total FROM clientes WHERE data_criacao >= CURRENT_DATE - INTERVAL '6 months' GROUP BY TO_CHAR(data_criacao, 'MM/YYYY'), DATE_TRUNC('month', data_criacao) ORDER BY DATE_TRUNC('month', data_criacao) ASC`;
            const resultClientes = await db.query(queryClientes);
            res.json({ faturamento: resultFaturamento.rows, leads: resultLeads.rows, clientes: resultClientes.rows });
        } catch (error) { res.status(500).json({ error: 'Erro' }); }
    });

    app.get('/api/backup', verificarToken, async (req, res) => {
        try {
            const nomeArquivo = `backup_${new Date().toISOString().split('T')[0]}.sql`;
            const caminhoArquivo = path.join(__dirname, nomeArquivo);
            const comando = `docker exec projeto_novo-db-1 pg_dump -U admin marketing_db > "${caminhoArquivo}"`;
            exec(comando, (error, stdout, stderr) => {
                if (error) return res.status(500).json({ error: 'Erro ao gerar backup.' });
                res.download(caminhoArquivo, nomeArquivo, (err) => {
                    if (fs.existsSync(caminhoArquivo)) fs.unlinkSync(caminhoArquivo);
                });
            });
        } catch (error) { res.status(500).json({ error: 'Erro' }); }
    });

    // ==========================================
    // NOVA ROTA: ALERTAS DO DASHBOARD
    // ==========================================
    app.get('/api/dashboard/alertas', verificarToken, async (req, res) => {
        try {
            const criativos = await db.query("SELECT COUNT(*) AS total FROM criativos WHERE status = 'pendente'");
            const postsRecusados = await db.query("SELECT COUNT(*) AS total FROM posts WHERE status = 'recusado'");
            const propostasAceitas = await db.query("SELECT COUNT(*) AS total FROM propostas WHERE status_aceite = 'aceita'");

            res.json({
                criativosPendentes: parseInt(criativos.rows[0].total) || 0,
                postsRecusados: parseInt(postsRecusados.rows[0].total) || 0,
                propostasAceitas: parseInt(propostasAceitas.rows[0].total) || 0
            });
        } catch (error) {
            console.error("Erro ao buscar alertas:", error.message);
            res.status(500).json({ error: 'Erro ao buscar alertas' });
        }
    });
};