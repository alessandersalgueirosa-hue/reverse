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
    const novaSenha = '123456'; // A senha que você vai digitar no portal

    try {
        console.log("⏳ Gerando hash da senha...");
        const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

        console.log(`⏳ Atualizando a senha do cliente ${email}...`);
        const result = await db.query(
            "UPDATE clientes SET senha = $1 WHERE email = $2 RETURNING *",
            [senhaCriptografada, email]
        );

        if (result.rowCount === 0) {
            console.log("❌ Cliente não encontrado no banco.");
        } else {
            console.log(`✅ Senha do cliente ${email} redefinida para: ${novaSenha}`);
            console.log("🎉 Agora você pode logar no Portal do Cliente!");
        }
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}

resetar();