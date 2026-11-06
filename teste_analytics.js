const { BetaAnalyticsDataClient } = require('@google-analytics/data');

// Configura o caminho para o arquivo de credenciais que você baixou
process.env.GOOGLE_APPLICATION_CREDENTIALS = './google-credentials.json';

const analyticsDataClient = new BetaAnalyticsDataClient();

async function runReport() {
  // COLOQUE AQUI O ID DA PROPRIEDADE (o número que você copiou no Passo 3)
  const propertyId = '560654921'; 

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'city' }], // Exemplo: agrupar por cidade
      metrics: [{ name: 'activeUsers' }], // Exemplo: usuários ativos
    });

    console.log('Conexão bem-sucedida! Dados dos últimos 30 dias:');
    response.rows.forEach(row => {
      console.log(`Cidade: ${row.dimensionValues[0].value} | Usuários Ativos: ${row.metricValues[0].value}`);
    });
  } catch (error) {
    console.error('Erro ao conectar:', error.message);
  }
}

runReport();