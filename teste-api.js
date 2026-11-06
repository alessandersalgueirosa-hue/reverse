// ALTERE A LINHA ABAIXO PARA O CAMINHO DA SUA CONEXÃO COM O BANCO
// Exemplo: require('./database'), require('./config/db'), etc.
const db = require('./db'); 

async function testarAPI() {
    console.log("🚀 Iniciando teste da API de Produtos...\n");

    // ---------------------------------------------------------
    // TESTE 1: Buscar Produtos (GET)
    // ---------------------------------------------------------
    console.log("🔍 TESTE 1: Buscando produtos no banco...");
    try {
        // Tenta buscar todos os produtos
        const [rows] = await db.query('SELECT * FROM produtos ORDER BY id DESC');
        console.log(`✅ SUCESSO: Encontrados ${rows.length} produtos.`);
        if (rows.length > 0) {
            console.log("   Último produto:", rows[0].nome);
        }
    } catch (error) {
        console.log("❌ ERRO NO GET:");
        console.error("   Mensagem:", error.message);
        console.log("   👉 SOLUÇÃO PROVÁVEL:");
        if (error.message.includes("doesn't exist")) {
            console.log("   A tabela 'produtos' não existe. Crie a tabela no banco.");
        } else if (error.message.includes("Unknown column")) {
            console.log("   Falta alguma coluna na tabela. O frontend envia 'status', 'estoque', 'sku', etc.");
        } else {
            console.log("   Verifique a string de conexão com o banco de dados (usuário/senha).");
        }
    }

    console.log("\n-------------------------------------------------\n");

    // ---------------------------------------------------------
    // TESTE 2: Inserir Produto (POST)
    // ---------------------------------------------------------
    console.log("📦 TESTE 2: Tentando inserir um produto de teste...");
    const produtoTeste = {
        nome: "Produto Script Teste " + Date.now(),
        descricao: "Teste via terminal",
        preco: 49.90,
        categoria: "Teste",
        sku: "SKU-" + Date.now(),
        estoque: 5,
        status: "ativo"
    };

    try {
        const query = `
            INSERT INTO produtos (nome, descricao, preco, categoria, sku, estoque, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const valores = [
            produtoTeste.nome, 
            produtoTeste.descricao, 
            produtoTeste.preco, 
            produtoTeste.categoria, 
            produtoTeste.sku, 
            produtoTeste.estoque, 
            produtoTeste.status
        ];

        const [result] = await db.query(query, valores);
        console.log(`✅ SUCESSO: Produto inserido com ID: ${result.insertId}`);
        
        // Limpa o produto de teste para não sujar seu banco
        await db.query('DELETE FROM produtos WHERE id = ?', [result.insertId]);
        console.log("🧹 Produto de teste removido automaticamente do banco.");
        
    } catch (error) {
        console.log("❌ ERRO NO INSERT (POST):");
        console.error("   Mensagem:", error.message);
        console.log("   👉 SOLUÇÃO PROVÁVEL:");
        if (error.message.includes("doesn't exist")) {
            console.log("   A tabela 'produtos' não existe. Crie no banco.");
        } else if (error.message.includes("Unknown column")) {
            console.log("   Falta a coluna '" + error.message.split("'")[1] + "' na sua tabela. Rode um ALTER TABLE.");
        } else if (error.code === 'ER_NO_REFERENCED_ROW') {
            console.log("   Erro de chave estrangeira (Foreign Key) faltando.");
        }
    }

    console.log("\n🏁 Fim dos testes.");
    process.exit(0);
}

// Executa os testes
testarAPI();