const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'minha-chave-secreta-super-segura-mudanca-em-producao';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Função de Segurança (Token) - MODO DE DESENVOLVIMENTO
function verificarToken(req, res, next) {
    req.user = { id: 1, email: 'admin@reverse.com', tipo: 'admin' };
    next();
}

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Servidor funcionando' }));

// LOGIN
// ==========================================
// ROTA DE LOGIN DO ADMINISTRADOR (CORRIGIDA)
// ==========================================
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // ⚠️ ATENÇÃO: Se a sua tabela não se chama 'usuarios', troque o nome abaixo.
        // Exemplo: 'admins' ou 'administradores'
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            console.log(`Tentativa de login falhou: e-mail ${email} não encontrado na tabela.`);
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const usuario = result.rows[0];
        
        // Verifica a senha
        const bcrypt = require('bcryptjs');
        let senhaValida = false;
        
        // Tenta validar com bcrypt, se der erro, verifica se a senha no banco é texto puro
        try {
            senhaValida = await bcrypt.compare(senha, usuario.senha);
        } catch(e) {
            senhaValida = (senha === usuario.senha);
        }

        // Se ainda não for válida, pode ser que a coluna não se chame 'senha' (ex: 'password')
        if (!senhaValida && usuario.password) {
             senhaValida = (senha === usuario.password) || (await bcrypt.compare(senha, usuario.password).catch(()=>false));
        }

        if (!senhaValida) {
            console.log(`Tentativa de login falhou: senha incorreta para ${email}.`);
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Gera o Token
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, tipo: 'admin' }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ token, tipo: 'admin' });

    } catch (error) {
        console.error("Erro no login do admin:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});
// LOGIN CLIENTE
app.post('/api/login-cliente', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    try {
        const result = await db.query('SELECT * FROM clientes WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas.' });
        const cliente = result.rows[0];
        const senhaValida = (senha === cliente.senha) || (await bcrypt.compare(senha, cliente.senha).catch(() => false));
        if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas.' });
        const token = jwt.sign({ id: cliente.id, email: cliente.email, tipo: 'cliente' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (error) { res.status(500).json({ error: 'Erro interno no servidor.' }); }
});

// ESQUECI MINHA SENHA
app.post('/api/esqueci-senha', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-mail é obrigatório.' });
    try {
        let user = null, isCliente = false;
        const adminRes = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (adminRes.rows.length > 0) { user = adminRes.rows[0]; } 
        else {
            const clienteRes = await db.query('SELECT * FROM clientes WHERE email = $1', [email]);
            if (clienteRes.rows.length > 0) { user = clienteRes.rows[0]; isCliente = true; }
        }
        if (!user) return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá uma nova senha.' });

        const novaSenha = Math.floor(100000 + Math.random() * 900000).toString();
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        if (isCliente) await db.query('UPDATE clientes SET senha = $1 WHERE id = $2', [senhaHash, user.id]);
        else await db.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [senhaHash, user.id]);

        const configRes = await db.query('SELECT * FROM email_configuracoes ORDER BY id DESC LIMIT 1');
        if (configRes.rows.length > 0) {
            const config = configRes.rows[0];
            const nodemailer = require('nodemailer');
            let transporter = nodemailer.createTransport({ host: config.host, port: config.port, secure: config.port === 465, auth: { user: config.user_email, pass: config.pass } });
            await transporter.sendMail({ from: `"${config.remetente_nome}" <${config.user_email}>`, to: email, subject: 'Recuperação de Senha', html: `<p>Sua nova senha é: <strong>${novaSenha}</strong></p>` });
        } else { console.log("Nova senha (e-mail não configurado):", novaSenha); }
        res.json({ message: 'Se o e-mail estiver cadastrado, você receberá uma nova senha.' });
    } catch (error) { res.status(500).json({ error: 'Erro interno no servidor.' }); }
});

// UPLOAD DE CRIATIVOS
const multer = require('multer');
const storageCriativos = multer.diskStorage({ 
    destination: (req, file, cb) => { const dir = path.join(__dirname, 'public', 'uploads', 'criativos'); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); cb(null, dir); }, 
    filename: (req, file, cb) => { const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); const ext = path.extname(file.originalname); cb(null, `${uniqueSuffix}${ext}`); } 
});
const uploadCriativos = multer({ storage: storageCriativos });

app.post('/api/clientes/:id/criativos', verificarToken, uploadCriativos.single('arquivo'), async (req, res) => {
    const { id } = req.params; const { titulo } = req.body;
    if (!req.file || !titulo) return res.status(400).json({ error: 'Arquivo e título são obrigatórios.' });
    const url_arquivo = `/uploads/criativos/${req.file.filename}`;
    try {
        const result = await db.query('INSERT INTO criativos (cliente_id, titulo, url_arquivo, status) VALUES ($1, $2, $3, $4) RETURNING *', [id, titulo, url_arquivo, 'pendente']);
        res.status(201).json({ message: 'Criativo enviado!', criativo: result.rows[0] });
    } catch (error) { res.status(500).json({ error: 'Erro interno ao salvar criativo' }); }
});

app.get('/api/admin/criativos', verificarToken, async (req, res) => {
    try {
        const result = await db.query(`SELECT c.*, cl.nome AS cliente_nome FROM criativos c LEFT JOIN clientes cl ON cl.id = c.cliente_id ORDER BY c.data_criacao DESC`);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar criativos' }); }
});

// ALTERAR SENHA DO CLIENTE
app.put('/api/portal/alterar-senha', verificarToken, async (req, res) => {
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) return res.status(400).json({ error: 'Preencha todos os campos.' });
    try {
        let clienteId = req.user.tipo === 'cliente' ? req.user.id : null;
        if (!clienteId) { const cli = await db.query('SELECT id FROM clientes LIMIT 1'); if (cli.rows.length > 0) clienteId = cli.rows[0].id; }
        if (!clienteId) return res.status(404).json({ error: 'Cliente não encontrado.' });
        const result = await db.query('SELECT senha FROM clientes WHERE id = $1', [clienteId]);
        const cliente = result.rows[0];
        const senhaValida = (senhaAtual === cliente.senha) || (await bcrypt.compare(senhaAtual, cliente.senha).catch(() => false));
        if (!senhaValida) return res.status(401).json({ error: 'Senha atual incorreta.' });
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        await db.query('UPDATE clientes SET senha = $1 WHERE id = $2', [novaSenhaHash, clienteId]);
        res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) { res.status(500).json({ error: 'Erro interno ao alterar senha.' }); }
});

// MAPEAMENTO DO CLIENTE
app.get('/api/clientes/:id/mapeamento', verificarToken, async (req, res) => {
    try {
        const idOuEmail = req.params.id; 
        let cliente = null;
        
        if (!isNaN(idOuEmail)) { 
            const resId = await db.query('SELECT nome, email FROM clientes WHERE id = $1', [idOuEmail]); 
            if (resId.rows.length > 0) cliente = resId.rows[0]; 
        } else { 
            const resEmail = await db.query('SELECT nome, email FROM clientes WHERE email = $1', [idOuEmail]); 
            if (resEmail.rows.length > 0) cliente = resEmail.rows[0]; 
        }
        
        if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });

        const result = await db.query(
            'SELECT * FROM mapeamentos_clientes WHERE nome_empresa ILIKE $1 OR nome_contato ILIKE $1 ORDER BY id DESC LIMIT 1', 
            [`%${cliente.nome}%`]
        );
        
        if (result.rows.length === 0) {
            return res.json({}); 
        }
        
        res.json(result.rows[0]);
    } catch (error) { 
        console.error("❌ Erro no banco ao buscar mapeamento:", error);
        res.status(500).json({ error: 'Erro interno' }); 
    }
});

// ==========================================
// CARREGAMENTO DOS MÓDULOS DE ROTAS
// ==========================================
require('./rotas_clientes')(app, db, verificarToken);
require('./rotas_leads')(app, db, verificarToken);
require('./rotas_prospects')(app, db, verificarToken);
require('./rotas_portal')(app, db, verificarToken);
require('./rotas_mapeamento')(app, db, verificarToken);
require('./rotas_dashboard')(app, db, verificarToken);
require('./rotas_briefing')(app, db, verificarToken);
require('./rotas_relatorio')(app, db, verificarToken);
require('./rotas_propostas')(app, db, verificarToken);
require('./rotas_gerais')(app, db, verificarToken);
require('./rotas_perfil_cliente')(app, db, JWT_SECRET);
require('./rotas_metricas')(app, db, verificarToken);

// BRIEFINGS
app.get('/api/admin/briefings', verificarToken, async (req, res) => {
    try {
        const result = await db.query(`SELECT b.*, c.nome AS cliente_nome, c.email AS cliente_email FROM briefings b LEFT JOIN clientes c ON c.id = b.cliente_id ORDER BY b.data_criacao DESC`);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar briefings' }); }
});

// ANALYTICS
try { require('./rotas_analytics')(app, db, verificarToken); } catch(e) { console.log("Aviso: Módulo de Analytics não encontrado."); }

// BRANDING
app.get('/api/branding/:cliente_id', verificarToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM branding WHERE cliente_id = $1 ORDER BY id DESC LIMIT 1', [req.params.cliente_id]);
        res.json(result.rows.length > 0 ? result.rows[0] : {});
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar branding' }); }
});

app.post('/api/branding', verificarToken, async (req, res) => {
    const { cliente_id, missao, visao, valores, publico_alvo, personalidade, tom_de_voz, cores_primarias, cores_secundarias, tipografia_principal, tipografia_secundaria, referencias_visuais } = req.body;
    try {
        const existe = await db.query('SELECT id FROM branding WHERE cliente_id = $1', [cliente_id]);
        if (existe.rows.length > 0) {
            await db.query(`UPDATE branding SET missao=$1, visao=$2, valores=$3, publico_alvo=$4, personalidade=$5, tom_de_voz=$6, cores_primarias=$7, cores_secundarias=$8, tipografia_principal=$9, tipografia_secundaria=$10, referencias_visuais=$11 WHERE cliente_id=$12`, [missao, visao, valores, publico_alvo, personalidade, tom_de_voz, cores_primarias, cores_secundarias, tipografia_principal, tipografia_secundaria, referencias_visuais, cliente_id]);
        } else {
            await db.query(`INSERT INTO branding (cliente_id, missao, visao, valores, publico_alvo, personalidade, tom_de_voz, cores_primarias, cores_secundarias, tipografia_principal, tipografia_secundaria, referencias_visuais) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [cliente_id, missao, visao, valores, publico_alvo, personalidade, tom_de_voz, cores_primarias, cores_secundarias, tipografia_principal, tipografia_secundaria, referencias_visuais]);
        }
        res.status(201).json({ message: 'Branding salvo com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar branding', detalhe: error.message });
    }
});

app.get('/api/admin/brandings', verificarToken, async (req, res) => {
    try {
        const result = await db.query(`SELECT b.*, c.nome AS cliente_nome FROM branding b LEFT JOIN clientes c ON c.id = b.cliente_id ORDER BY b.data_criacao DESC`);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar brandings:", error);
        res.status(500).json({ error: 'Erro ao buscar brandings' });
    }
});

// POSTS (CALENDÁRIO EDITORIAL)
app.get('/api/posts', verificarToken, async (req, res) => {
    try {
        const isCliente = req.user.tipo === 'cliente';
        let query, params;
        if (isCliente) {
            query = 'SELECT p.*, c.nome AS cliente_nome FROM posts p LEFT JOIN clientes c ON c.id = p.cliente_id WHERE p.cliente_id = $1 ORDER BY p.data_publicacao ASC';
            params = [req.user.id];
        } else {
            query = 'SELECT p.*, c.nome AS cliente_nome FROM posts p LEFT JOIN clientes c ON c.id = p.cliente_id ORDER BY p.data_publicacao ASC';
            params = [];
        }
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar posts' }); }
});

app.post('/api/posts', verificarToken, async (req, res) => {
    const { cliente_id, data_publicacao, plataforma, titulo, conteudo, url_midia } = req.body;
    try {
        const result = await db.query('INSERT INTO posts (cliente_id, data_publicacao, plataforma, titulo, conteudo, url_midia) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [cliente_id, data_publicacao, plataforma, titulo, conteudo, url_midia]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Erro ao criar post' }); }
});

app.put('/api/posts/:id', verificarToken, async (req, res) => {
    const { status, feedback_cliente } = req.body;
    try {
        await db.query('UPDATE posts SET status = COALESCE($1, status), feedback_cliente = COALESCE($2, feedback_cliente) WHERE id = $3', [status, feedback_cliente, req.params.id]);
        res.json({ message: 'Post atualizado' });
    } catch (error) { res.status(500).json({ error: 'Erro ao atualizar post' }); }
});

app.delete('/api/posts/:id', verificarToken, async (req, res) => {
    try {
        await db.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
        res.json({ message: 'Post excluído' });
    } catch (error) { res.status(500).json({ error: 'Erro ao excluir post' }); }
});

// PERMISSÕES
app.get('/api/permissoes/:cliente_id', verificarToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM permissoes_clientes WHERE cliente_id = $1', [req.params.cliente_id]);
        res.json(result.rows.length > 0 ? result.rows[0] : { cliente_id: req.params.cliente_id });
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar permissões' }); }
});

app.post('/api/permissoes/:cliente_id', verificarToken, async (req, res) => {
    const { pode_ver_metricas, pode_ver_financeiro, pode_ver_calendario, pode_ver_branding, pode_ver_propostas, pode_ver_campanhas, pode_ver_tarefas } = req.body;
    const cliente_id = req.params.cliente_id;
    try {
        const existe = await db.query('SELECT id FROM permissoes_clientes WHERE cliente_id = $1', [cliente_id]);
        if (existe.rows.length > 0) {
            await db.query(`UPDATE permissoes_clientes SET pode_ver_metricas=$1, pode_ver_financeiro=$2, pode_ver_calendario=$3, pode_ver_branding=$4, pode_ver_propostas=$5, pode_ver_campanhas=$6, pode_ver_tarefas=$7, data_atualizacao = CURRENT_TIMESTAMP WHERE cliente_id=$8`, [pode_ver_metricas, pode_ver_financeiro, pode_ver_calendario, pode_ver_branding, pode_ver_propostas, pode_ver_campanhas, pode_ver_tarefas, cliente_id]);
        } else {
            await db.query(`INSERT INTO permissoes_clientes (cliente_id, pode_ver_metricas, pode_ver_financeiro, pode_ver_calendario, pode_ver_branding, pode_ver_propostas, pode_ver_campanhas, pode_ver_tarefas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [cliente_id, pode_ver_metricas, pode_ver_financeiro, pode_ver_calendario, pode_ver_branding, pode_ver_propostas, pode_ver_campanhas, pode_ver_tarefas]);
        }
        res.status(201).json({ message: 'Permissões salvas!' });
    } catch (error) { res.status(500).json({ error: 'Erro ao salvar permissões' }); }
});

// PERFIL CLIENTE
require('./rotas_perfil_cliente')(app, db, JWT_SECRET);
// ROTA: ENVIAR E-MAIL (Disparo de Campanha)
app.post('/api/enviar-email', verificarToken, async (req, res) => {
    const { destinatario, assunto, conteudoHtml } = req.body;

    if (!destinatario || !assunto || !conteudoHtml) {
        return res.status(400).json({ error: 'Preencha todos os campos: destinatário, assunto e corpo do e-mail.' });
    }

    try {
        // Busca as configurações de e-mail no banco
        const configRes = await db.query('SELECT * FROM email_configuracoes ORDER BY id DESC LIMIT 1');
        if (configRes.rows.length === 0) {
            return res.status(400).json({ error: 'Nenhuma configuração de e-mail encontrada. Configure o SMTP primeiro.' });
        }

        const config = configRes.rows[0];
        const nodemailer = require('nodemailer');

        // Cria o transportador
        let transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.port === 465, // true para 465, false para outras portas
            auth: {
                user: config.user_email,
                pass: config.pass
            }
        });

        // Envia o e-mail
        await transporter.sendMail({
            from: `"${config.remetente_nome || 'Reverse Marketing'}" <${config.user_email}>`,
            to: destinatario,
            subject: assunto,
            html: conteudoHtml
        });

        res.json({ message: 'E-mail enviado com sucesso!' });
    } catch (error) {
        console.error("=== ERRO AO ENVIAR E-MAIL ===");
        console.error("Mensagem:", error.message);
        res.status(500).json({ error: 'Erro ao enviar e-mail', detalhe: error.message });
    }
});
// ==========================================
// ROTAS DE CONFIGURAÇÃO DE E-MAIL
// ==========================================

// Salvar Configurações
app.post('/api/configuracoes-email', verificarToken, async (req, res) => {
    const { remetente_nome, user_email, pass, host, port, brevo_api_key } = req.body;

    try {
        console.log("=== SALVANDO CONFIGURAÇÕES DE E-MAIL ===");
        console.log("Dados recebidos:", req.body);

        const existe = await db.query('SELECT id FROM email_configuracoes ORDER BY id DESC LIMIT 1');

        if (existe.rows.length > 0) {
            await db.query(`
                UPDATE email_configuracoes SET 
                    remetente_nome = $1, 
                    user_email = $2, 
                    pass = $3, 
                    host = $4, 
                    port = $5, 
                    brevo_api_key = $6
                WHERE id = $7
            `, [remetente_nome, user_email, pass, host, port, brevo_api_key, existe.rows[0].id]);
        } else {
            await db.query(`
                INSERT INTO email_configuracoes (remetente_nome, user_email, pass, host, port, brevo_api_key)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [remetente_nome, user_email, pass, host, port, brevo_api_key]);
        }

        res.status(201).json({ message: 'Configurações salvas com sucesso!' });
    } catch (error) {
        console.error("=== ERRO AO SALVAR CONFIGURAÇÕES ===");
        console.error("Mensagem:", error.message);
        console.error("Código:", error.code);
        res.status(500).json({ error: 'Erro ao salvar configurações', detalhe: error.message });
    }
});

// Buscar Configurações
app.get('/api/configuracoes-email', verificarToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM email_configuracoes ORDER BY id DESC LIMIT 1');
        res.json(result.rows.length > 0 ? result.rows[0] : {});
    } catch (error) {
        console.error("Erro ao buscar configurações:", error.message);
        res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
});
// ==========================================
// ROTAS DE PLANEJAMENTO ESTRATÉGICO (BSC)
// ==========================================

app.get('/api/planejamento', verificarToken, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT p.*, c.nome AS cliente_nome 
            FROM planejamento p
            LEFT JOIN clientes c ON c.id = p.cliente_id
            ORDER BY p.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar planejamentos:", error.message);
        res.status(500).json({ error: 'Erro ao buscar planejamentos' });
    }
});

app.post('/api/planejamento', verificarToken, async (req, res) => {
    const {
        cliente, nomeCampanha, dataInicio, dataFim,
        orcamentoTotal, metaFaturamento, metaROAS, metaCAC,
        persona, metaNPS, propostaValor, canais,
        entregaveis, ferramentas, responsavel, cronograma,
        treinamento, inovacao, posicionamentoMarca
    } = req.body;

    try {
        const query = `
            INSERT INTO planejamento (
                cliente_id, nome_campanha, data_inicio, data_fim,
                orcamento_total, meta_faturamento, meta_roas, meta_cac,
                persona, meta_nps, proposta_valor, canais,
                entregaveis, ferramentas, responsavel, cronograma,
                treinamento, inovacao, posicionamento_marca
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
            RETURNING *
        `;
        const values = [
            cliente, nomeCampanha, dataInicio, dataFim,
            orcamentoTotal, metaFaturamento, metaROAS, metaCAC,
            persona, metaNPS, propostaValor, canais,
            entregaveis, ferramentas, responsavel, cronograma,
            treinamento, inovacao, posicionamentoMarca
        ];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao salvar planejamento:", error.message);
        res.status(500).json({ error: 'Erro ao salvar planejamento', detalhe: error.message });
    }
});

app.delete('/api/planejamento/:id', verificarToken, async (req, res) => {
    try {
        await db.query('DELETE FROM planejamento WHERE id = $1', [req.params.id]);
        res.json({ message: 'Planejamento excluído.' });
    } catch (error) {
        console.error("Erro ao excluir planejamento:", error.message);
        res.status(500).json({ error: 'Erro ao excluir planejamento' });
    }
});
// INICIA O SERVIDOR
app.listen(PORT, () => { console.log(`Servidor rodando em http://localhost:${PORT}`); });