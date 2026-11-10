const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { limitadorLogin } = require('./rateLimitLogin'); // <--- IMPORTADO AQUI

module.exports = function(app, db, JWT_SECRET) {
    
    // ROTA DE LOGIN DO CLIENTE COM RATE LIMIT
    app.post('/api/login-cliente', limitadorLogin, async (req, res) => {
        const { email, senha } = req.body;
        try {
            const result = await db.query('SELECT * FROM clientes WHERE email = $1', [email]);
            if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas.' });
            const cliente = result.rows[0];

            const senhaValida = await bcrypt.compare(senha, cliente.senha);
            if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas.' });

            let permissoes = {};
            try {
                const permResult = await db.query('SELECT * FROM permissoes_clientes WHERE cliente_id = $1', [cliente.id]);
                if (permResult.rows.length > 0) permissoes = permResult.rows[0];
            } catch (e) {}

            const token = jwt.sign({ id: cliente.id, email: cliente.email, tipo: 'cliente' }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, tipo: 'cliente', permissoes });
        } catch (error) {
            res.status(500).json({ error: 'Erro no banco: ' + error.message });
        }
    });

    // ROTA DO PERFIL
    app.get('/api/portal/perfil', (req, res) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(401).json({ error: 'Token inválido.' });
            try {
                const result = await db.query('SELECT nome, email FROM clientes WHERE id = $1', [decoded.id]);
                if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });
                res.json(result.rows[0]);
            } catch (error) { res.status(500).json({ error: 'Erro ao buscar perfil.' }); }
        });
    });
};