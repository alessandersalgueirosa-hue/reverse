const fs = require('fs');
const path = require('path');

// 1. LIMPAR O SERVER.JS (Remover rotas soltas antigas)
const caminhoServer = path.join(__dirname, 'server.js');
let serverConteudo = fs.readFileSync(caminhoServer, 'utf8');

// Remove a rota de leads solta no server.js (se existir)
serverConteudo = serverConteudo.replace(/app\.get\('\/api\/leads'[\s\S]*?\}\);/g, '');
// Remove a rota de tarefas solta no server.js (se existir)
serverConteudo = serverConteudo.replace(/app\.get\('\/api\/tarefas'[\s\S]*?\}\);/g, '');

// Garante que os arquivos de rotas estão sendo chamados
if (!serverConteudo.includes("require('./rotas_leads')")) {
    serverConteudo = serverConteudo.replace("app.listen", "require('./rotas_leads')(app, db, verificarToken);\napp.listen");
}
if (!serverConteudo.includes("require('./rotas_portal')")) {
    serverConteudo = serverConteudo.replace("app.listen", "require('./rotas_portal')(app, db, verificarToken);\napp.listen");
}

fs.writeFileSync(caminhoServer, serverConteudo, 'utf8');
console.log("✅ server.js limpo e organizado.");

// 2. CRIAR/ATUALIZAR O ARQUIVO rotas_leads.js
const caminhoLeads = path.join(__dirname, 'rotas_leads.js');
const codigoLeads = `
module.exports = function(app, db, verificarToken) {
    app.get('/api/leads', verificarToken, async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM leads ORDER BY data_criacao DESC');
            res.json(result.rows);
        } catch (error) {
            console.error("Erro no banco ao buscar leads:", error.message);
            res.status(500).json({ error: 'Erro ao buscar leads' });
        }
    });

    app.get('/api/tarefas', verificarToken, async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM tarefas ORDER BY data_criacao DESC');
            res.json(result.rows);
        } catch (error) {
            console.error("Erro no banco ao buscar tarefas:", error.message);
            res.status(500).json({ error: 'Erro ao buscar tarefas' });
        }
    });
};
`;
fs.writeFileSync(caminhoLeads, codigoLeads, 'utf8');
console.log("✅ rotas_leads.js criado com as rotas de Leads e Tarefas.");

// 3. CORRIGIR O leads.html (Garantir que a função carregarLeads está certa)
const caminhoLeadsHtml = path.join(__dirname, 'public', 'leads.html');
if (fs.existsSync(caminhoLeadsHtml)) {
    let htmlConteudo = fs.readFileSync(caminhoLeadsHtml, 'utf8');
    
    // Substitui a função carregarLeads antiga por uma nova e segura
    const funcaoNova = `
        async function carregarLeads() {
            try {
                const response = await fetch('/api/leads', {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                });
                if (response.status === 401) {
                    window.location.href = '/login.html';
                    return;
                }
                if (!response.ok) throw new Error('Erro HTTP: ' + response.status);
                
                todosOsLeads = await response.json();
                aplicarFiltros();
            } catch (error) {
                console.error('Erro ao carregar leads:', error);
                document.getElementById('tabelaLeads').innerHTML = '<tr><td colspan="7" class="p-4 text-center text-red-500">Erro ao carregar leads.</td></tr>';
            }
        }
    `;
    
    // Faz a troca da função no arquivo
    htmlConteudo = htmlConteudo.replace(/async function carregarLeads\(\)[\s\S]*?\}\s*\n/g, funcaoNova);
    fs.writeFileSync(caminhoLeadsHtml, htmlConteudo, 'utf8');
    console.log("✅ leads.html corrigido.");
}

console.log("🚀 Faxina concluída! Agora reinicie o servidor.");