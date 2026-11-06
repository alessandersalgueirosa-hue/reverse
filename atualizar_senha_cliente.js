const { Pool } = require('pg');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function atualizar() {
    try {
        console.log("1. Criando coluna 'senha' na tabela clientes (se não existir)...");
        await db.query('ALTER TABLE clientes ADD COLUMN IF NOT EXISTS senha VARCHAR(255);');
        console.log("✅ Coluna criada/verificada.");

        console.log("2. Definindo senha do cliente de teste...");
        await db.query("UPDATE clientes SET senha = '123456' WHERE email = 'teste@cliente.com';");
        console.log("✅ Senha '123456' definida para o e-mail teste@cliente.com");

        console.log("🎉 TUDO PRONTO! Agora você pode logar no portal do cliente.");
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}

atualizar();