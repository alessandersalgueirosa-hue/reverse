const { Pool } = require('pg');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function popular() {
    try {
        console.log("⏳ Buscando o primeiro cliente do banco...");
        const cli = await db.query('SELECT id FROM clientes LIMIT 1');
        if (cli.rows.length === 0) {
            console.log("❌ Nenhum cliente cadastrado. Cadastre um cliente primeiro.");
            return;
        }
        const clienteId = cli.rows[0].id;

        console.log("1. Limpando receitas e despesas antigas de teste...");
        await db.query("DELETE FROM receitas WHERE descricao LIKE '%Teste%' OR descricao LIKE '%Mensalidade%'");
        await db.query("DELETE FROM despesas WHERE descricao LIKE '%Teste%' OR descricao LIKE '%Software%'");

        console.log("2. Inserindo receitas para o mês atual (Novembro)...");
        await db.query(`
            INSERT INTO receitas (cliente_id, descricao, valor, data) 
            VALUES 
            ($1, 'Mensalidade de Gestão de Tráfego', 2500.00, CURRENT_DATE),
            ($1, 'Setup de Campanha', 800.00, CURRENT_DATE),
            ($1, 'Gestão de Redes Sociais', 1200.00, CURRENT_DATE)
        `, [clienteId]);

        console.log("3. Inserindo despesas...");
        await db.query(`
            INSERT INTO despesas (cliente_id, descricao, valor, data, categoria) 
            VALUES 
            ($1, 'Assinatura Ferramenta de Design', 150.00, CURRENT_DATE, 'Software'),
            ($1, 'Tráfego Pago (Verba de Anúncios)', 500.00, CURRENT_DATE, 'Mídia')
        `, [clienteId]);

        console.log("4. Inserindo campanhas...");
        await db.query(`
            INSERT INTO campanhas (nome, descricao, data_inicio, data_fim, orcamento, cliente_id) 
            VALUES 
            ('Lançamento de Produto X', 'Campanha de lançamento', CURRENT_DATE, CURRENT_DATE + interval '30 days', 5000.00, $1)
        `, [clienteId]);

        console.log("🎉 Dados de teste inseridos com sucesso! Vá no Dashboard e aperte F5.");
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}

popular();