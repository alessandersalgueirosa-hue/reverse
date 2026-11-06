const { Pool } = require('pg');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function testar() {
    try {
        console.log("1. Tentando criar cliente...");
        // Tenta inserir com os campos básicos
        const clienteRes = await db.query(`
            INSERT INTO clientes (nome, email, tipo) 
            VALUES ('Cliente Teste', 'teste@cliente.com', 'PJ') 
            RETURNING id
        `);
        const clienteId = clienteRes.rows[0].id;
        console.log("✅ Cliente criado com ID:", clienteId);

        console.log("2. Criando tarefa...");
        await db.query(`
            INSERT INTO tarefas (titulo, descricao, data_vencimento, concluida) 
            VALUES ('Criar Campanha de Tráfego Pago', 'Campanha de lançamento do produto X.', '2026-12-31', false)
        `);

        console.log("3. Criando criativo...");
        await db.query(`
            INSERT INTO criativos (cliente_id, titulo, url_arquivo, status) 
            VALUES ($1, 'Banner Promoção de Natal', 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=600&h=400&fit=crop', 'pendente')
        `, [clienteId]);

        console.log("🎉 SUCESSO! Tudo foi inserido no banco.");
    } catch (erro) {
        // AQUI ESTÁ O SEGREDO: Imprimir o erro completo, não só a mensagem
        console.error("❌ ERRO DETALHADO NO BANCO:");
        console.error(erro);
    } finally {
        process.exit();
    }
}
testar();