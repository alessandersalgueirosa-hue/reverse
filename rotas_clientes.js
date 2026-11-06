const bcrypt = require('bcryptjs');

module.exports = function(app, db, verificarToken) {
    
    // Listar todos os clientes
    app.get('/api/clientes', verificarToken, async (req, res) => { 
        try { 
            const result = await db.query(`
                SELECT c.*, 
                       COALESCE((SELECT COUNT(*) FROM leads l WHERE l.cliente_id = c.id), 0) AS total_leads, 
                       COALESCE((SELECT COUNT(*) FROM campanhas ca WHERE ca.cliente_id = c.id), 0) AS total_campanhas 
                FROM clientes c 
                ORDER BY c.id DESC
            `); 
            res.json(result.rows); 
        } catch (error) { 
            console.error("Erro ao buscar clientes:", error.message);
            
            // Se a tabela leads ou campanhas sumir, busca só os clientes puros para não quebrar a tela
            if (error.code === '42P01') {
                try {
                    const fallback = await db.query('SELECT * FROM clientes ORDER BY id DESC');
                    return res.json(fallback.rows.map(c => ({ ...c, total_leads: 0, total_campanhas: 0 })));
                } catch (fallbackError) {
                    console.error("Erro no fallback:", fallbackError.message);
                }
            }
            
            res.status(500).json({ error: 'Erro interno ao buscar clientes' }); 
        } 
    });

    // Buscar cliente por ID
    app.get('/api/clientes/:id', verificarToken, async (req, res) => { 
        try { 
            const result = await db.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]); 
            if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado.' }); 
            res.json(result.rows[0]); 
        } catch (error) { 
            res.status(500).json({ error: 'Erro interno ao buscar cliente' }); 
        } 
    });

    // Criar novo cliente
    app.post('/api/clientes', verificarToken, async (req, res) => { 
        const { tipo, nome, razao_social, cpf, cnpj, email, telefone, celular, endereco, cidade, estado, cep, data_nascimento, observacoes, senha } = req.body; 
        if (!tipo || !nome || !email) return res.status(400).json({ error: 'Tipo, nome e e-mail são obrigatórios.' }); 
        
        try { 
            let senhaCriptografada = null;
            if (senha && senha.trim() !== '') {
                senhaCriptografada = await bcrypt.hash(senha, 10);
            }

            const query = `
                INSERT INTO clientes (
                    tipo, nome, razao_social, cpf, cnpj, email, telefone, 
                    celular, endereco, cidade, estado, cep, data_nascimento, 
                    observacoes, senha, status
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
                ) RETURNING *
            `;
            
            const values = [
                tipo, 
                nome, 
                razao_social || null, 
                cpf || null, 
                cnpj || null, 
                email, 
                telefone || null, 
                celular || null, 
                endereco || null, 
                cidade || null, 
                estado || null, 
                cep || null, 
                data_nascimento || null, 
                observacoes || null, 
                senhaCriptografada,
                req.body.status || 'ativo'
            ];

            const result = await db.query(query, values);
            res.status(201).json({ message: 'Cliente salvo com sucesso!', cliente: result.rows[0] }); 
        } catch (error) { 
            console.error("=== ERRO DETALHADO AO SALVAR CLIENTE ===");
            console.error("Mensagem:", error.message);
            console.error("Código:", error.code);
            console.error("Detalhe:", error.detail);
            
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Este e-mail, CPF ou CNPJ já está cadastrado. Verifique os dados.' }); 
            }
            res.status(500).json({ error: 'Erro interno ao salvar cliente', detalhe: error.message }); 
        } 
    });

    // Atualizar cliente
    app.put('/api/clientes/:id', verificarToken, async (req, res) => { 
        const { tipo, nome, razao_social, cpf, cnpj, email, telefone, celular, endereco, cidade, estado, cep, data_nascimento, observacoes, status } = req.body; 
        try { 
            await db.query('UPDATE clientes SET tipo = $1, nome = $2, razao_social = $3, cpf = $4, cnpj = $5, email = $6, telefone = $7, celular = $8, endereco = $9, cidade = $10, estado = $11, cep = $12, data_nascimento = $13, observacoes = $14, status = $15 WHERE id = $16', [tipo, nome, razao_social || null, cpf || null, cnpj || null, email, telefone || null, celular || null, endereco || null, cidade || null, estado || null, cep || null, data_nascimento || null, observacoes || null, status || 'ativo', req.params.id]); 
            res.json({ message: 'Cliente atualizado com sucesso.' }); 
        } catch (error) { 
            res.status(500).json({ error: 'Erro interno ao atualizar cliente' }); 
        } 
    });

    // Excluir cliente
    app.delete('/api/clientes/:id', verificarToken, async (req, res) => { 
        try { 
            await db.query('DELETE FROM clientes WHERE id = $1', [req.params.id]); 
            res.json({ message: 'Cliente excluído com sucesso.' }); 
        } catch (error) { 
            console.error("Erro ao excluir cliente:", error);
            
            if (error.code === '23503') {
                return res.status(400).json({ error: 'Não é possível excluir. Existem dados vinculados (Leads, Campanhas, etc).' });
            }
            res.status(500).json({ error: 'Erro interno ao excluir cliente.' }); 
        } 
    });

    // Buscar o mapeamento completo do cliente (Agência)
    app.get('/api/clientes/:id/mapeamento', verificarToken, async (req, res) => {
        try {
            const clienteId = parseInt(req.params.id);
            if (isNaN(clienteId)) return res.status(400).json({ error: 'ID do cliente inválido.' });

            const clienteRes = await db.query('SELECT nome, email FROM clientes WHERE id = $1', [clienteId]);
            if (clienteRes.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });
            
            const cliente = clienteRes.rows[0];

            const result = await db.query(
                'SELECT * FROM mapeamentos_clientes WHERE nome_empresa ILIKE $1 OR email ILIKE $2 ORDER BY id DESC LIMIT 1', 
                [`%${cliente.nome}%`, cliente.email]
            );
            
            if (result.rows.length === 0) {
                return res.json({});
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao buscar mapeamento:", error);
            res.status(500).json({ error: 'Erro interno ao buscar mapeamento' });
        }
    });
};