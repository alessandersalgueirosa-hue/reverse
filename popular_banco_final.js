const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const db = new Pool({ host: 'localhost', port: 5432, user: 'admin', password: 'admin123', database: 'marketing_db' });

async function popular() {
    try {
        console.log("⏳ Populando o banco com dados de teste...");

        // Limpa os dados de teste anteriores para não duplicar
        await db.query(`DELETE FROM clientes WHERE email = 'teste@empresa.com'`); 

        // 1. Criar Cliente
        const senhaHash = await bcrypt.hash('123456', 10);
        const clienteRes = await db.query(`
            INSERT INTO clientes (tipo, nome, email, telefone, senha) 
            VALUES ('PJ', 'Empresa Fictícia LTDA', 'teste@empresa.com', '11999999999', $1) 
            RETURNING id
        `, [senhaHash]);
        const clienteId = clienteRes.rows[0].id;
        console.log(`✅ Cliente criado (ID: ${clienteId})`);

        // 2. Criar Tarefas
        await db.query(`
            INSERT INTO tarefas (cliente_id, titulo, descricao, data_vencimento, concluida) VALUES 
            ($1, 'Criar Campanha de Tráfego', 'Configurar público e anúncios no Meta Ads.', CURRENT_DATE + 5, false),
            ($1, 'Aprovar Criativo do Instagram', 'Validar arte do post de lançamento.', CURRENT_DATE + 2, false),
            ($1, 'Reunião de Alinhamento', 'Reunião mensal de resultados.', CURRENT_DATE - 2, true)
        `, [clienteId]);
        console.log("✅ Tarefas criadas");

        // 3. Criar Mapeamento
        await db.query(`
            INSERT INTO mapeamentos_clientes (nome_empresa, segmento, objetivo_principal) 
            VALUES ('Empresa Fictícia LTDA', 'Tecnologia', 'Aumentar vendas em 30%')
        `);
        console.log("✅ Mapeamento criado");

        // 4. Criar Branding
        await db.query(`
            INSERT INTO branding (cliente_id, missao, visao, valores, publico_alvo, cores_primarias, tipografia_principal) 
            VALUES ($1, 'Inovar o mercado', 'Ser líder em 5 anos', 'Transparência e Foco', 'Jovens de 20 a 35 anos', '#FF0000', 'Montserrat')
        `, [clienteId]);
        console.log("✅ Branding criado");

        // 5. Criar Post (Calendário)
        await db.query(`
            INSERT INTO posts (cliente_id, data_publicacao, plataforma, titulo, conteudo, status) 
            VALUES ($1, CURRENT_DATE + 1, 'Instagram', 'Post de Lançamento', 'Vem aí a maior novidade do ano!', 'pendente')
        `, [clienteId]);
        console.log("✅ Post agendado");

        // 6. Criar Financeiro
        await db.query(`
            INSERT INTO receitas (cliente_id, descricao, valor, data) 
            VALUES ($1, 'Mensalidade de Gestão', 2500.00, CURRENT_DATE)
        `, [clienteId]);
        await db.query(`
            INSERT INTO despesas (cliente_id, descricao, valor, data, categoria) 
            VALUES ($1, 'Anúncios Meta Ads', 500.00, CURRENT_DATE, 'Tráfego')
        `, [clienteId]);
        console.log("✅ Financeiro criado");

        // 7. Criar Lead (SEM O CAMPO TELEFONE)
        await db.query(`
            INSERT INTO leads (nome, email, empresa, origem, status) 
            VALUES ('João da Silva', 'joao@email.com', 'Empresa X', 'Instagram', 'novo')
        `);
        console.log("✅ Lead criado");

        // 8. Criar Criativo Pendente
        await db.query(`
            INSERT INTO criativos (cliente_id, titulo, url_arquivo, status) 
            VALUES ($1, 'Banner Promoção', 'https://via.placeholder.com/600x400?text=Banner', 'pendente')
        `, [clienteId]);
        console.log("✅ Criativo pendente criado");

        // 9. Configurar Permissões
        await db.query(`
            INSERT INTO permissoes_clientes (cliente_id, pode_ver_metricas, pode_ver_financeiro, pode_ver_calendario, pode_ver_branding, pode_ver_propostas, pode_ver_campanhas, pode_ver_tarefas) 
            VALUES ($1, true, true, true, true, true, true, true)
        `, [clienteId]);
        console.log("✅ Permissões liberadas");

        console.log("🎉 BANCO POPULADO COM SUCESSO!");
        console.log("👉 Login do Cliente: teste@empresa.com");
        console.log("👉 Senha do Cliente: 123456");

    } catch (erro) {
        console.error("❌ Erro detalhado:", erro.message);
    } finally {
        process.exit();
    }
}

popular();