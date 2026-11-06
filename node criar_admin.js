const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function criarAdmin() {
    try {
        console.log("⏳ Garantindo que a tabela 'usuarios' existe...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL
            );
        `);

        console.log("⏳ Gerando senha...");
        const hash = await bcrypt.hash('123456', 10);

        console.log("⏳ Inserindo/Atualizando Admin...");
        await db.query(`
            INSERT INTO usuarios (email, senha) 
            VALUES ('admin@reverse.com', $1) 
            ON CONFLICT (email) DO UPDATE SET senha = $1
        `, [hash]);

        console.log("✅ TUDO PRONTO! Admin recriado.");
        console.log("   E-mail: admin@reverse.com");
        console.log("   Senha: 123456");
    } catch (erro) {
        console.error("❌ Erro detalhado:", erro.message);
    } finally {
        process.exit();
    }
}

criarAdmin();