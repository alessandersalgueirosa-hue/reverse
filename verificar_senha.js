const bcrypt = require('bcryptjs');
const db = require('./db');

async function verificar() {
    try {
        const email = 'alessander.salgueirosa@gmail.com';
        console.log(`🔍 Buscando o cliente ${email} no banco...`);
        
        const result = await db.query('SELECT id, nome, email, senha FROM clientes WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            console.log("❌ Cliente não encontrado com esse e-mail!");
            process.exit(0);
        }

        const cliente = result.rows[0];
        console.log("✅ Cliente encontrado:", cliente.nome);
        
        if (!cliente.senha) {
            console.log("❌ A coluna 'senha' está VAZIA no banco de dados.");
            process.exit(0);
        }

        console.log("🔐 Hash da senha salva no banco:", cliente.senha);

        // Testa se a senha "123456" bate com o hash salvo
        const senhaValida = await bcrypt.compare('123456', cliente.senha);
        
        if (senhaValida) {
            console.log("\n✅ SUCESSO! A senha '123456' é válida para este cliente.");
            console.log("O problema está no código de login do backend (rotas_perfil_cliente.js).");
        } else {
            console.log("\n❌ ERRO! A senha '123456' NÃO bate com o hash do banco.");
            console.log("O script de resetar senha pode não ter funcionado.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Erro no banco de dados:", error.message);
        process.exit(1);
    }
}

verificar();