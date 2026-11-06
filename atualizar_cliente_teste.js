const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const db = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'marketing_db',
});

async function atualizar() {
    try {
        const novoEmail = 'alessander.salgueirosa@gmail.com';
        const novaSenha = '123456'; // A senha que você vai usar para logar
        const novoNome = 'Alessander Salgueirosa';

        console.log("⏳ Gerando hash da nova senha...");
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        // Atualiza o cliente de teste (ID 9 ou o primeiro da lista)
        console.log("⏳ Atualizando cadastro do cliente...");
        await db.query(`
            UPDATE clientes 
            SET nome = $1, email = $2, senha = $3 
            WHERE email = 'teste@cliente.com' OR id = 9
        `, [novoNome, novoEmail, senhaHash]);

        console.log(`✅ Cliente atualizado!`);
        console.log(`   E-mail para login: ${novoEmail}`);
        console.log(`   Senha para login: ${novoSenha}`);
        console.log("Agora faça login no Portal com esses dados.");
    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}

atualizar();