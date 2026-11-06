const db = require('./db');
const bcrypt = require('bcryptjs');

async function resetar() {
    try {
        console.log("🔍 Conectando ao banco...");
        
        // Testa a conexão básica primeiro
        await db.query('SELECT 1');
        console.log("✅ Conexão com o banco OK.");

        const email = 'alessander.salgueirosa@gmail.com';
        const senhaHash = await bcrypt.hash('123456', 10);

        console.log("⏳ Verificando se o Alessander já existe...");
        const check = await db.query("SELECT id FROM clientes WHERE email = $1", [email]);
        
        let clienteId;
        if (check.rows.length === 0) {
            console.log("Criando o cliente Alessander...");
            const res = await db.query(
                "INSERT INTO clientes (nome, email, senha, tipo) VALUES ($1, $2, $3, 'PF') RETURNING id",
                ['Alessander', email, senhaHash]
            );
            clienteId = res.rows[0].id;
            console.log("✅ Alessander criado com sucesso! ID:", clienteId);
        } else {
            clienteId = check.rows[0].id;
            await db.query("UPDATE clientes SET senha = $1 WHERE id = $2", [senhaHash, clienteId]);
            console.log("✅ Alessander já existia. Senha resetada para 123456.");
        }

        console.log("⏳ Verificando permissões...");
        try {
            await db.query(`
                INSERT INTO permissoes_clientes (cliente_id, pode_ver_tarefas) 
                VALUES ($1, true) 
                ON CONFLICT (cliente_id) DO NOTHING
            `, [clienteId]);
            console.log("✅ Permissões garantidas.");
        } catch (err) {
            console.log("⚠️ Aviso: A tabela de permissões pode não existir ou ter outro formato. Pulando esta etapa.");
        }

        console.log("\n🎉 TUDO PRONTO! Tente fazer o login agora.");
        
    } catch (error) {
        console.error("\n❌ ERRO COMPLETO:");
        console.error(error); // Imprime o objeto de erro completo para vermos o que houve
    }
    process.exit();
}

resetar();