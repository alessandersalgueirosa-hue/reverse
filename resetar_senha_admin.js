const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function resetar() {
    const email = 'alessander.salgueirosa@gmail.com'; // O e-mail da sua imagem
    const novaSenha = 'admin123'; // A senha provisória que você vai usar

    try {
        console.log("⏳ Gerando hash da senha...");
        const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

        console.log(`⏳ Atualizando a senha do ADMIN ${email}...`);
        const result = await db.query(
            "UPDATE usuarios SET senha = $1 WHERE email = $2 RETURNING *",
            [senhaCriptografada, email]
        );

        if (result.rowCount === 0) {
            console.log("❌ Usuário Admin não encontrado no banco.");
        } else {
            console.log(`✅ Senha do ADMIN ${email} redefinida para: ${novaSenha}`);
            console.log("🎉 Agora você pode logar no sistema!");
        }
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}

resetar();