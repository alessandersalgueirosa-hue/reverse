const db = require('./db');
const bcrypt = require('bcryptjs');

async function recriarTudo() {
    try {
        console.log("⏳ Iniciando a reconstrução do banco de dados...\n");

        // 1. Criar Tabelas Básicas
        await db.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE,
                telefone VARCHAR(50),
                tipo VARCHAR(20),
                senha VARCHAR(255),
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'clientes' pronta.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS criativos (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                titulo VARCHAR(200),
                url_arquivo TEXT,
                status VARCHAR(50) DEFAULT 'pendente',
                feedback TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'criativos' pronta.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS tarefas (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(200) NOT NULL,
                descricao TEXT,
                data_vencimento DATE,
                concluida BOOLEAN DEFAULT false,
                cliente_id INTEGER REFERENCES clientes(id),
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'tarefas' pronta.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS permissoes_clientes (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER UNIQUE REFERENCES clientes(id) ON DELETE CASCADE,
                pode_ver_metricas BOOLEAN DEFAULT false,
                pode_ver_financeiro BOOLEAN DEFAULT false,
                pode_ver_calendario BOOLEAN DEFAULT false,
                pode_ver_branding BOOLEAN DEFAULT false,
                pode_ver_propostas BOOLEAN DEFAULT false,
                pode_ver_campanhas BOOLEAN DEFAULT false,
                pode_ver_tarefas BOOLEAN DEFAULT true,
                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'permissoes_clientes' pronta.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                plataforma VARCHAR(50),
                titulo VARCHAR(200),
                conteudo TEXT,
                data_publicacao DATE,
                status VARCHAR(50) DEFAULT 'pendente',
                feedback_cliente TEXT,
                url_midia TEXT,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Tabela 'posts' pronta.");

        // 2. Recriar o Cliente Alessander
        console.log("\n⏳ Cadastrando o cliente Alessander...");
        const senhaHash = await bcrypt.hash('123456', 10);
        
        // Verifica se ele já existe para não duplicar
        const check = await db.query("SELECT id FROM clientes WHERE email = 'alessander.salgueirosa@gmail.com'");
        
        let clienteId;
        if (check.rows.length === 0) {
            const res = await db.query(
                "INSERT INTO clientes (nome, email, senha, tipo) VALUES ($1, $2, $3, $4) RETURNING id",
                ['Alessander', 'alessander.salgueirosa@gmail.com', senhaHash, 'PF']
            );
            clienteId = res.rows[0].id;
            console.log("✅ Alessander criado com sucesso!");
        } else {
            clienteId = check.rows[0].id;
            await db.query("UPDATE clientes SET senha = $1 WHERE id = $2", [senhaHash, clienteId]);
            console.log("ℹ️ Alessander já existia. Senha atualizada para 123456.");
        }

        // 3. Dar permissões a ele
        await db.query(`
            INSERT INTO permissoes_clientes (cliente_id, pode_ver_tarefas) 
            VALUES ($1, true) 
            ON CONFLICT (cliente_id) DO NOTHING
        `, [clienteId]);

        // 4. Criar um criativo de teste para ele
        const checkCriativo = await db.query("SELECT id FROM criativos WHERE cliente_id = $1", [clienteId]);
        if (checkCriativo.rows.length === 0) {
            await db.query(
                "INSERT INTO criativos (cliente_id, titulo, url_arquivo) VALUES ($1, $2, $3)",
                [clienteId, 'Criativo de Teste', 'https://via.placeholder.com/600x400']
            );
            console.log("✅ Criativo de teste criado.");
        }

        console.log("\n🎉 TUDO PRONTO! O sistema foi restaurado.");
        console.log("Para logar, use:");
        console.log("Link: http://localhost:3000/login-cliente.html");
        console.log("Email: alessander.salgueirosa@gmail.com");
        console.log("Senha: 123456");

    } catch (error) {
        console.error("\n❌ ERRO AO RECRIAR:", error.message);
    }
    process.exit();
}

recriarTudo();