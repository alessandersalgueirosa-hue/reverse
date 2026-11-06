module.exports = function(db) {
    // Middleware que verifica se o cliente tem a permissão para acessar a rota
    const verificarPermissao = (colunaPermissao) => {
        return async (req, res, next) => {
            // Se for admin, deixa passar
            if (req.user.tipo === 'admin') return next();

            // Se for cliente, busca as permissões no banco
            try {
                const result = await db.query('SELECT * FROM permissoes_clientes WHERE cliente_id = $1', [req.user.id]);
                if (result.rows.length === 0) {
                    // Se não tiver registro, cria um padrão (opcional)
                    return res.status(403).json({ error: 'Acesso negado. Permissão não configurada.' });
                }

                const permissoes = result.rows[0];
                if (!permissoes[colunaPermissao]) {
                    return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para acessar esta área.' });
                }
                next();
            } catch (error) {
                console.error("Erro no middleware de permissão:", error);
                res.status(500).json({ error: 'Erro ao verificar permissões.' });
            }
        };
    };

    return { verificarPermissao };
};