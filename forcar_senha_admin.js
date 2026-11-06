const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function forcar() {
    const email = 'alessander.salgueirosa@gmail.com';
    const senhaPura = 'admin123';

    try {
        console.log("1. Buscando usuário no banco...");
        const userRes = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        
        if (userRes.rows.length === 0) {
            console.log(`❌ O e-mail ${email} NÃO existe na tabela 'usuarios'.`);
            console.log("Vou criar esse usuário para você agora...");
            
            const hash = await bcrypt.hash(senhaPura, 10);
            await db.query(
                "INSERT INTO usuarios (email, senha) VALUES ($1, $2)",
                [email, hash]
            );
            console.log("✅ Usuário criado com sucesso! Senha: admin123");
        } else {
            console.log("✅ Usuário encontrado. Forçando a senha...");
            
            // Salva a senha em texto puro (caso o sistema antigo use texto puro)
            await db.query("UPDATE usuarios SET senha = $1 WHERE email = $2", [senhaPura, email]);
            
            // Verifica se salvou
            const check = await db.query("SELECT senha FROM usuarios WHERE email = $1", [email]);
            console.log("Senha salva no banco agora é:", check.rows[0].senha);
        }
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}

forcar();