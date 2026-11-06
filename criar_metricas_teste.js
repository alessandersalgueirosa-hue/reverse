const { Pool } = require('pg');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function criar() {
    try {
        // Busca o ID do cliente teste
        const clienteRes = await db.query("SELECT id FROM clientes WHERE email = 'teste@cliente.com'");
        
        if (clienteRes.rows.length === 0) {
            console.log("❌ Cliente 'teste@cliente.com' não encontrado.");
            return;
        }
        
        const clienteId = clienteRes.rows[0].id;
        console.log(`✅ Cliente encontrado (ID: ${clienteId}). Inserindo dados...`);

        // Insere 3 campanhas de teste para gerar os gráficos
        await db.query(`
            INSERT INTO trafego_pago (cliente_id, plataforma, nome_campanha, investimento_total, impressoes, cliques, conversoes) 
            VALUES 
            ($1, 'Meta Ads', 'Campanha de Lançamento', 1500.00, 45000, 1200, 45),
            ($1, 'Google Ads', 'Campanha de Remarketing', 800.00, 15000, 850, 30),
            ($1, 'Meta Ads', 'Campanha de Seguidores', 300.00, 8000, 400, 10)
        `, [clienteId]);

        console.log("🎉 Dados de teste inseridos com sucesso! Vá no Portal e clique em Resultados.");
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}

criar();