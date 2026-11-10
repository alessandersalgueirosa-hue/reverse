// server.js — Lote 2: dotenv + cache de configurações
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('./db');
const configCache = require('./configCache');
const { limitadorLogin } = require('./rateLimitLogin');

const app = express();

// Confia no proxy reverso (Nginx) para capturar IP real via x-forwarded-for
app.set('trust proxy', 1);

// CORS TOTALMENTE ABERTO PARA TESTE
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

// ==========================================
// ROTA DE LOGIN (ADMIN) COM RATE LIMIT
// ==========================================
app.post('/api/login', limitadorLogin, async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas.' });
        const usuario = result.rows[0];
        const bcrypt = require('bcryptjs');
        let senhaValida = false;
        try { senhaValida = await bcrypt.compare(senha, usuario.senha); } catch(e) { senhaValida = (senha === usuario.senha); }
        if (!senhaValida && usuario.password) {
             senhaValida = (senha === usuario.password) || (await bcrypt.compare(senha, usuario.password).catch(()=>false));
        }
        if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas.' });
        const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, tipo: 'admin' });
    } catch (error) {
        console.error("Erro no login:", error.message);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// ROTA DA PÁGINA PÚBLICA DE ASSINATURA
app.get('/assinar/:token', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'assinar_proposta.html'));
});

// ROTA DE PRODUTOS
app.get('/api/produtos', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM produtos ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/produtos', async (req, res) => {
    console.log("🔥 ENTROU NA ROTA POST /api/produtos. Dados:", req.body);
    try {
        const { nome, descricao, preco, categoria, sku, estoque, status } = req.body;
        const result = await db.query(
            'INSERT INTO produtos (nome, descricao, preco, categoria, sku, estoque, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nome, descricao || null, preco, categoria || null, sku || null, estoque || 0, status || 'ativo']
        );
        console.log("✅ Produto salvo no banco com sucesso!");
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows[0]));
    } catch (error) {
        console.error("❌ ERRO NO BANCO:", error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro ao salvar: ' + error.message }));
    }
});

const rotasParaCarregar = [
    { path: './rotas_analytics', nome: 'Analytics' },
    { path: './rotas_dashboard', nome: 'Dashboard' },
    { path: './rotas_clientes', nome: 'Clientes' },
    { path: './rotas_prospects', nome: 'Prospects' },
    { path: './rotas_leads', nome: 'Leads' },
    { path: './rotas_gerais', nome: 'Gerais' },
    { path: './rotas_criativos', nome: 'Criativos' },
    { path: './rotas_mapeamento', nome: 'Mapeamento' },
    { path: './rotas_briefings', nome: 'Briefings' },
    { path: './rotas_metricas', nome: 'Metricas' },
    { path: './rotas_relatorio', nome: 'Relatorio' },
    { path: './rotas_propostas', nome: 'Propostas' },
    { path: './rotas_portal', nome: 'Portal' },
    { path: './rotas_comentarios', nome: 'Comentarios' },
    { path: './rotas_permissoes', nome: 'Permissoes' },
    { path: './rotas_posts', nome: 'Posts' },
    { path: './rotas_configuracoes', nome: 'Configuracoes' },
    { path: './rotas_notificacoes', nome: 'Notificacoes' },
    { path: './rotas_atividades', nome: 'Atividades' }
];

rotasParaCarregar.forEach(rota => {
    try {
        const modulo = require(rota.path);
        modulo(app, db, verificarToken);
    } catch (error) {
        console.error(`❌ ERRO AO CARREGAR ROTA ${rota.nome}:`, error.message);
    }
});

try {
    const rotasPerfilCliente = require('./rotas_perfil_cliente');
    rotasPerfilCliente(app, db, JWT_SECRET);
} catch (error) {
    console.error(`❌ ERRO AO CARREGAR ROTA PerfilCliente:`, error.message);
}

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error("⚠️ ERRO INTERNO NA ROTA:", err.message);
    res.status(500).json({ error: 'Erro interno no servidor', detalhe: err.message });
});

process.on('uncaughtException', (err) => {
    console.error('⚠️ ERRO NÃO CAPTURADO:', err.message);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Promessa rejeitada não tratada:', reason);
});

const PORT = process.env.PORT || 3001;

async function iniciar() {
    console.log('🔄 Carregando cache de configurações...');
    await configCache.reload();
    app.listen(PORT, () => {
        console.log(`✅ Servidor rodando perfeitamente na porta ${PORT}`);
    });
}

iniciar();