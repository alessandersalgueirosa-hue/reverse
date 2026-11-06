const bcrypt = require('bcryptjs');
const db = require('./db');

async function resetar() {
    try {
        console.log("⏳ Gerando a nova senha criptografada...");
        // Cria o hash da senha "123456"
        const novaSenhaCriptografada = await bcrypt.hash('123456', 10);

        console.log("⏳ Atualizando a senha no banco de dados...");
        // Atualiza a senha do Alessander
        const result = await db.query(
            `UPDATE clientes SET senha = $1 WHERE email = 'alessander.salgueirosa@gmail.com' RETURNING id, nome, email`,
            [novaSenhaCriptografada]
        );

        if (result.rows.length > 0) {
            console.log("✅ Senha do cliente resetada com sucesso!");
            console.log("Cliente:", result.rows[0].nome);
            console.log("E-mail:", result.rows[0].email);
            console.log("Nova senha para login: 123456");
        } else {
            console.log("⚠️ Cliente não encontrado com esse e-mail.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ ERRO AO RESETAR SENHA:", error.message);
        process.exit(1);
    }
}

resetar();