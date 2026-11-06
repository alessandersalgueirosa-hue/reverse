module.exports = function(app, db, verificarToken) {
    
    // Buscar comentários (Funciona para Tarefa, Criativo ou Post)
    app.get('/api/comentarios/:tipo/:id', verificarToken, async (req, res) => {
        const { tipo, id } = req.params;
        
        let colunaId = '';
        if (tipo === 'tarefa') colunaId = 'tarefa_id';
        else if (tipo === 'criativo') colunaId = 'criativo_id';
        else if (tipo === 'post') colunaId = 'post_id';
        else return res.status(400).json({ error: 'Tipo inválido' });

        try {
            const query = `
                SELECT c.*, 
                       CASE 
                           WHEN c.usuario_tipo = 'admin' THEN 'Agência'
                           ELSE 'Cliente'
                       END AS autor_nome
                FROM comentarios c
                WHERE c.${colunaId} = $1 
                ORDER BY c.data_criacao ASC
            `;
            const result = await db.query(query, [id]);
            res.json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar comentários:", error.message);
            // Se a coluna não existir, avisa no console mas não quebra a tela
            if (error.message.includes("column") && error.message.includes("does not exist")) {
                return res.json([]); 
            }
            res.status(500).json({ error: 'Erro ao buscar comentários' });
        }
    });

    // Enviar novo comentário
    app.post('/api/comentarios', verificarToken, async (req, res) => {
        const { mensagem, tarefa_id, criativo_id, post_id } = req.body;
        
        // Identifica quem está enviando (admin ou cliente)
        const usuario_id = req.user.id;
        const usuario_tipo = req.user.tipo; 

        if (!mensagem || mensagem.trim() === '') {
            return res.status(400).json({ error: 'A mensagem não pode estar vazia.' });
        }

        try {
            const query = `
                INSERT INTO comentarios (mensagem, usuario_id, usuario_tipo, tarefa_id, criativo_id, post_id) 
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
            `;
            const values = [
                mensagem.trim(), 
                usuario_id, 
                usuario_tipo, 
                tarefa_id || null, 
                criativo_id || null, 
                post_id || null
            ];

            const result = await db.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao enviar comentário:", error.message);
            res.status(500).json({ error: 'Erro ao enviar comentário' });
        }
    });
};