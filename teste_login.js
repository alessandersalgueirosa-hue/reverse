const db = require('./db');
const bcrypt = require('bcryptjs');

async function testeLogin() {
    try {
        console.log("1️⃣ Testando conexão com o banco...");
        await db.query('SELECT 1');
        console.log("   ✅ Banco conectado.");

        console.log("\n2️⃣ Buscando o cliente Alessander...");
        const res = await db.query("SELECT * FROM clientes WHERE email = 'alessander.salgueirosa@gmail.com'");
        
        if (res.rows.length === 0) {
            console.log("   ❌ ERRO: O cliente não existe na tabela 'clientes'.");
            return;
        }
        const cliente = res.rows[0];
        console.log(`   ✅ Cliente encontrado. ID: ${cliente.id}, Nome: ${cliente.nome}`);

        console.log("\n3️⃣ Verificando a senha...");
        const senhaValida = await bcrypt.compare('123456', cliente.senha);
        if (!senhaValida) {
            console.log("   ❌ ERRO: A senha '123456' não bate com o banco.");
        } else {
            console.log("   ✅ Senha correta.");
        }

        console.log("\n4️⃣ Testando busca de permissões...");
        try {
            const perm = await db.query("SELECT * FROM permissoes_clientes WHERE cliente_id = $1", [cliente.id]);
            console.log("   ✅ Tabela de permissões OK.");
        } catch (err) {
            console.log("   ❌ ERRO na tabela de permissões:", err.message);
        }

        console.log("\n5️⃣ Testando geração de Token...");
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';
        const token = jwt.sign({ id: cliente.id, email: cliente.email, tipo: 'cliente' }, JWT_SECRET, { expiresIn: '24h' });
        console.log("   ✅ Token gerado com sucesso.");

        console.log("\n🎉 TESTE CONCLUÍDO! O login deveria funcionar. O problema está no servidor não ter reiniciado ou no cache.");
        
    } catch (error) {
        console.error("\n❌ ERRO FATAL NO TESTE:");
        console.error(error.message);
    }
    process.exit();
}

testeLogin();