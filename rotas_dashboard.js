module.exports = function(app, db, verificarToken) {
    
    app.get('/api/dashboard', verificarToken, async (req, res) => {
        try {
            // 1. Contagem de Clientes
            const clientesRes = await db.query('SELECT COUNT(*) AS total FROM clientes');
            
            // 2. Contagem de Criativos Pendentes (aguardando aprovação)
            const criativosPendentesRes = await db.query("SELECT COUNT(*) AS total FROM criativos WHERE status = 'pendente'");
            
            // 3. Contagem de Campanhas
            const campanhasRes = await db.query('SELECT COUNT(*) AS total FROM campanhas');
            
            // 4. Faturamento do mês atual (Soma das receitas do mês)
            const faturamentoRes = await db.query(`
                SELECT COALESCE(SUM(valor), 0) AS total 
                FROM receitas 
                WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
            `);

            // Retorna todos os dados para o frontend
            res.json({
                totalClientes: parseInt(clientesRes.rows[0].total) || 0,
                criativosPendentes: parseInt(criativosPendentesRes.rows[0].total) || 0,
                totalCampanhas: parseInt(campanhasRes.rows[0].total) || 0,
                faturamentoMes: parseFloat(faturamentoRes.rows[0].total) || 0
            });
            
        } catch (error) {
            console.error("❌ Erro ao buscar dados do dashboard:", error);
            res.status(500).json({ error: 'Erro ao carregar dashboard' });
        }
    });
};