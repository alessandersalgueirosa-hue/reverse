module.exports = function(app, db, verificarToken) {
    
    // Salvar um novo mapeamento (formulário de onboarding)
    app.post('/api/mapeamento', async (req, res) => { 
        const { 
            nome_empresa, cnpj, segmento, site, telefone, nome_contato, 
            objetivo_principal, meta_business, google_ads, google_analytics, 
            site_hospedagem, manual_marca, observacoes_acessos, observacoes_gerais 
        } = req.body; 
        
        try { 
            const result = await db.query(`
                INSERT INTO mapeamentos_clientes (
                    nome_empresa, cnpj, segmento, site, telefone, nome_contato, 
                    objetivo_principal, acesso_meta, acesso_google_ads, acesso_google_analytics, 
                    acesso_site, manual_marca, observacoes_acessos, observacoes_gerais
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`, 
                [
                    nome_empresa, cnpj, segmento, site, telefone, nome_contato, 
                    objetivo_principal, 
                    meta_business || false, 
                    google_ads || false, 
                    google_analytics || false, 
                    site_hospedagem || false, 
                    manual_marca || false, 
                    observacoes_acessos, 
                    observacoes_gerais
                ]
            ); 
            res.status(201).json({ message: 'Mapeamento salvo com sucesso!', mapeamento: result.rows[0] }); 
        } catch (error) { 
            console.error("=== ERRO DETALHADO AO SALVAR MAPEAMENTO ===");
            console.error("Mensagem:", error.message);
            console.error("Código:", error.code);
            console.error("Detalhe:", error.detail);
            res.status(500).json({ error: 'Erro interno ao salvar mapeamento', detalhe: error.message }); 
        } 
    });

    // Listar todos os mapeamentos salvos
    app.get('/api/mapeamento', verificarToken, async (req, res) => { 
        try { 
            const result = await db.query('SELECT * FROM mapeamentos_clientes ORDER BY data_criacao DESC'); 
            res.json(result.rows); 
        } catch (error) { 
            console.error("Erro ao buscar mapeamentos:", error);
            res.status(500).json({ error: 'Erro interno ao buscar mapeamentos' }); 
        } 
    });

    // Excluir mapeamento
    app.delete('/api/mapeamento/:id', verificarToken, async (req, res) => {
        try {
            await db.query('DELETE FROM mapeamentos_clientes WHERE id = $1', [req.params.id]);
            res.json({ message: 'Mapeamento excluído com sucesso.' });
        } catch (error) {
            console.error("Erro ao excluir mapeamento:", error);
            res.status(500).json({ error: 'Erro interno ao excluir mapeamento' });
        }
    });
};