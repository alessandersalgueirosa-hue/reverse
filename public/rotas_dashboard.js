module.exports = function(app, db, verificarToken) {
    
    app.get('/api/dashboard', verificarToken, async (req, res) => {
        try {
            const clientesRes = await db.query('SELECT COUNT(*) AS total FROM clientes');
            const criativosPendentesRes = await db.query("SELECT COUNT(*) AS total FROM criativos WHERE status = 'pendente'");
            const campanhasRes = await db.query('SELECT COUNT(*) AS total FROM campanhas');
            
            const faturamentoRes = await db.query(`
                SELECT COALESCE(SUM(valor), 0) AS total 
                FROM receitas 
                WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
            `);

            res.json({
                totalClientes: parseInt(clientesRes.rows[0].total) || 0,
                criativosPendentes: parseInt(criativosPendentesRes.rows[0].total) || 0,
                totalCampanhas: parseInt(campanhasRes.rows[0].total) || 0,
                faturamentoMes: parseFloat(faturamentoRes.rows[0].total) || 0
            });
        } catch (error) {
            console.error("Erro ao buscar dados do dashboard:", error);
            res.status(500).json({ error: 'Erro ao carregar dashboard' });
        }
    });
};