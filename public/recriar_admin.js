const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function recriar() {
    try {
        console.log("⏳ Gerando senha criptografada...");
        const hash = await bcrypt.hash('123456', 10);

        console.log("⏳ Inserindo/Atualizando usuário admin...");
        await db.query(`
            INSERT INTO usuarios (email, senha) 
            VALUES ('admin@reverse.com', $1) 
            ON CONFLICT (email) DO UPDATE SET senha = $1
        `, [hash]);

        console.log("✅ Usuário admin@reverse.com pronto!");
        console.log("   Senha: 123456");
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}

recriar();