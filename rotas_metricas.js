module.exports = function(app, db, verificarToken) {
    
    // Rota que fornece os dados para os gráficos do Portal do Cliente
    app.get('/api/portal/metricas', verificarToken, async (req, res) => {
        try {
            const isCliente = req.user.tipo === 'cliente';
            
            const query = isCliente 
                ? 'SELECT plataforma, nome_campanha, investimento_total, impressoes, cliques, conversoes FROM trafego_pago WHERE cliente_id = $1 ORDER BY data_criacao DESC' 
                : 'SELECT plataforma, nome_campanha, investimento_total, impressoes, cliques, conversoes FROM trafego_pago ORDER BY data_criacao DESC';
            
            const params = isCliente ? [req.user.id] : [];
            
            // Tenta buscar os dados
            const result = await db.query(query, params);
            
            // Se não houver dados, retorna um array vazio (o frontend lidará com isso)
            res.json(result.rows);
            
        } catch (error) {
            console.error("❌ Erro ao buscar métricas:", error.message);
            
            // Se a tabela não existir, avisa no log mas retorna array vazio para não quebrar a tela
            if (error.message.includes("does not exist")) {
                console.log("Aviso: Tabela 'trafego_pago' não existe. Retornando dados vazios.");
                return res.json([]);
            }
            
            res.status(500).json({ error: 'Erro ao buscar métricas' });
        }
    });

};