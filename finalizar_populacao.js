const { Pool } = require('pg');
const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function finalizar() {
    try {
        console.log("⏳ Finalizando a população...");

        // Busca o ID do cliente teste
        const clienteRes = await db.query("SELECT id FROM clientes WHERE email = 'teste@empresa.com'");
        if (clienteRes.rows.length === 0) {
            console.log("❌ Cliente não encontrado.");
            return;
        }
        const clienteId = clienteRes.rows[0].id;

        // 1. Criar Lead (sem a coluna telefone)
        await db.query(`
            INSERT INTO leads (nome, email, empresa, origem, status) 
            VALUES ('João da Silva', 'joao@email.com', 'Empresa X', 'Instagram', 'novo')
        `);
        console.log("✅ Lead criado");

        // 2. Criar Criativo Pendente
        await db.query(`
            INSERT INTO criativos (cliente_id, titulo, url_arquivo, status) 
            VALUES ($1, 'Banner Promoção', 'https://via.placeholder.com/600x400?text=Banner', 'pendente')
        `, [clienteId]);
        console.log("✅ Criativo pendente criado");

        // 3. Configurar Permissões
        await db.query(`
            INSERT INTO permissoes_clientes (cliente_id, pode_ver_metricas, pode_ver_financeiro, pode_ver_calendario, pode_ver_branding, pode_ver_propostas, pode_ver_campanhas, pode_ver_tarefas) 
            VALUES ($1, true, true, true, true, true, true, true)
        `, [clienteId]);
        console.log("✅ Permissões liberadas");

        console.log("🎉 BANCO POPULADO COM SUCESSO!");
        console.log("👉 Login do Cliente: teste@empresa.com");
        console.log("👉 Senha do Cliente: 123456");

    } catch (erro) {
        console.error("❌ Erro:", erro.message);
    } finally {
        process.exit();
    }
}

finalizar();