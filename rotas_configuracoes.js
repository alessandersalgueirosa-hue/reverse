// rotas_configuracoes.js — versão corrigida (admin-only + validações)
// API da Central de Configurações. Acesso restrito ao administrador.
const configCache = require('./configCache');
const mailer = require('./mailer');

module.exports = (app, db, verificarToken) => {

    // ⚠️ CORREÇÃO 1: bloqueia acesso de clientes (só admin altera configs)
    const apenasAdmin = (req, res, next) => {
        if (!req.user || req.user.tipo !== 'admin') {
            return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
        }
        next();
    };

    const ADMIN = [verificarToken, apenasAdmin];

    // ---- LISTAR (senhas mascaradas) ----
    app.get('/api/configuracoes', ...ADMIN, async (req, res) => {
        try {
            const result = await db.query(
                'SELECT chave, valor, tipo, descricao, criptografado, atualizado_em FROM configuracoes ORDER BY chave'
            );
            const itens = result.rows.map(r => ({
                chave: r.chave,
                valor: r.criptografado ? '••••••••' : (r.valor || ''),
                tipo: r.tipo,
                descricao: r.descricao,
                criptografado: r.criptografado,
                atualizado_em: r.atualizado_em
            }));
            res.json(itens);
        } catch (err) {
            console.error('Erro GET /api/configuracoes:', err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // ---- ATUALIZAR ----
    app.put('/api/configuracoes', ...ADMIN, async (req, res) => {
        try {
            const alteracoes = req.body;
            if (!alteracoes || typeof alteracoes !== 'object') {
                return res.status(400).json({ error: 'Corpo da requisição inválido.' });
            }

            // === VALIDAÇÕES ===
            // CORREÇÃO 3: valida e-mail se enviado e não vazio
            const validarEmail = (campo, valor) => {
                if (valor === undefined || valor === null || valor === '') return;
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim())) {
                    throw new Error(`${campo}: e-mail inválido`);
                }
            };
            validarEmail('email_user', alteracoes.email_user);
            validarEmail('email_agencia', alteracoes.email_agencia);

            // CORREÇÃO 2: senha — não permite limpar acidentalmente
            if (alteracoes.email_senha !== undefined) {
                const senha = String(alteracoes.email_senha).trim();
                if (senha === '••••••••' || senha === '') {
                    delete alteracoes.email_senha; // não altera nada
                } else {
                    const semEspaco = senha.replace(/\s+/g, '');
                    if (semEspaco.length !== 16) {
                        return res.status(400).json({
                            error: 'Senha de app do Gmail inválida. Deve ter 16 caracteres (sem contar espaços).'
                        });
                    }
                    alteracoes.email_senha = semEspaco;
                }
            }

            // Base URL: precisa começar com http/https, sem barra no final
            if (alteracoes.base_url !== undefined) {
                const url = String(alteracoes.base_url).trim();
                if (url && !/^https?:\/\//.test(url)) {
                    return res.status(400).json({ error: 'Base URL deve começar com http:// ou https://' });
                }
                alteracoes.base_url = url.replace(/\/+$/, '');
            }

            // === APLICA ===
            let atualizados = 0;
            for (const [chave, valor] of Object.entries(alteracoes)) {
                if (valor === undefined || valor === null) continue;
                if (valor === '••••••••') continue;

                const meta = await db.query(
                    'SELECT tipo, criptografado FROM configuracoes WHERE chave = $1', [chave]
                );
                if (meta.rows.length === 0) continue;

                const { tipo, criptografado } = meta.rows[0];
                await configCache.set(chave, valor, tipo, criptografado);
                atualizados++;
            }

            await configCache.reload();
            mailer.invalidarTransporter();
            res.json({ ok: true, mensagem: `${atualizados} configuração(ões) salva(s).`, atualizados });
        } catch (err) {
            console.error('Erro PUT /api/configuracoes:', err.message);
            const status = /inválid|deve começar|16 caracteres/i.test(err.message) ? 400 : 500;
            res.status(status).json({ error: err.message });
        }
    });

    // ---- TESTAR E-MAIL ----
    app.post('/api/configuracoes/testar-email', ...ADMIN, async (req, res) => {
        try {
            const { email_destino } = req.body;
            if (!email_destino) {
                return res.status(400).json({ error: 'Informe o e-mail de destino.' });
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email_destino).trim())) {
                return res.status(400).json({ error: 'E-mail de destino inválido.' });
            }
            const ok = await mailer.testarConexao(String(email_destino).trim());
            if (ok) {
                res.json({ ok: true, mensagem: `E-mail de teste enviado para ${email_destino}.` });
            } else {
                res.status(500).json({ error: 'Falha ao enviar e-mail. Verifique as credenciais.' });
            }
        } catch (err) {
            console.error('Erro POST /api/configuracoes/testar-email:', err.message);
            res.status(500).json({ error: err.message });
        }
    });
};