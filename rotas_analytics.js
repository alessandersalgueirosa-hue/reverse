const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'google-credentials.json');
const analyticsDataClient = new BetaAnalyticsDataClient();

module.exports = function(app, db, verificarToken) {
    
    // IMPORTA O MIDDLEWARE DE PERMISSÕES
    const middlewares = require('./middlewares')(db);

    // Rota para o Dashboard (Resumo) - PROTEGIDA
    app.get('/api/analytics/resumo', verificarToken, middlewares.verificarPermissao('pode_ver_metricas'), async (req, res) => {
        try {
            const propertyId = '560654921'; // ⚠️ COLOQUE SEU ID AQUI

            const [response] = await analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'sessions' },
                    { name: 'screenPageViews' }
                ],
            });

            if (response.rows && response.rows.length > 0) {
                const row = response.rows[0];
                res.json({
                    usuariosAtivos: row.metricValues[0].value,
                    sessoes: row.metricValues[1].value,
                    visualizacoes: row.metricValues[2].value
                });
            } else {
                res.json({ usuariosAtivos: 0, sessoes: 0, visualizacoes: 0 });
            }
        } catch (error) {
            console.error("Erro no resumo do Analytics:", error);
            res.status(500).json({ error: 'Erro ao buscar resumo' });
        }
    });

    // Rota para a Página de Métricas (Detalhado por dia) - PROTEGIDA
    app.get('/api/analytics/detalhado', verificarToken, middlewares.verificarPermissao('pode_ver_metricas'), async (req, res) => {
        try {
            const propertyId = '560654921'; // ⚠️ COLOQUE SEU ID AQUI

            const [response] = await analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'date' }],
                metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
                orderBys: [{ dimension: { dimensionName: 'date' } }]
            });

            const dados = response.rows.map(row => {
                const dataStr = row.dimensionValues[0].value;
                const dia = dataStr.substring(6, 8);
                const mes = dataStr.substring(4, 6);
                return {
                    data: `${dia}/${mes}`,
                    usuarios: parseInt(row.metricValues[0].value),
                    sessoes: parseInt(row.metricValues[1].value)
                };
            });

            res.json(dados);
        } catch (error) {
            console.error("Erro no detalhado do Analytics:", error);
            res.status(500).json({ error: 'Erro ao buscar dados detalhados' });
        }
    });
};