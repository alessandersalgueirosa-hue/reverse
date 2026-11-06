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
        console.log("1. Criando a tabela 'usuarios' se ela não existir...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL
            );
        `);

        console.log("2. Gerando senha criptografada...");
        const hash = await bcrypt.hash('123456', 10);

        console.log("3. Inserindo o usuário admin...");
        await db.query(`
            INSERT INTO usuarios (email, senha) 
            VALUES ('admin@reverse.com', $1) 
            ON CONFLICT (email) DO UPDATE SET senha = $1
        `, [hash]);

        console.log("✅ TUDO PRONTO!");
        console.log("   E-mail: admin@reverse.com");
        console.log("   Senha: 123456");
    } catch (erro) {
        console.error("❌ Erro detalhado:", erro);
    } finally {
        process.exit();
    }
}

recriar();