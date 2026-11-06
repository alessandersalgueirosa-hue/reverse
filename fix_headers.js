const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/);
    let title = titleMatch ? titleMatch[1] : 'Reverse Marketing';
    title = title.replace(' - Reverse Marketing', '').trim();

    const newHeader = `
    <header class="bg-slate-900 border-b border-slate-800 p-4 flex flex-wrap justify-between items-center gap-4">
        <div class="flex items-center gap-3">
            <div class="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white">R</div>
            <h1 class="text-xl font-bold">${title}</h1>
        </div>
        <div class="flex flex-wrap items-center gap-4 text-sm">
            <a href="/admin.html" class="text-slate-400 hover:text-white transition-colors">Dashboard</a>
            <a href="/leads.html" class="text-slate-400 hover:text-white transition-colors">Leads</a>
            <a href="/clientes.html" class="text-slate-400 hover:text-white transition-colors">Clientes</a>
            <a href="/prospects.html" class="text-slate-400 hover:text-white transition-colors">Prospects</a>
            <a href="/campanhas.html" class="text-slate-400 hover:text-white transition-colors">Campanhas</a>
            <a href="/inbound.html" class="text-slate-400 hover:text-white transition-colors">Inbound</a>
            <a href="/outbound.html" class="text-slate-400 hover:text-white transition-colors">Outbound</a>
            <a href="/financeiro.html" class="text-slate-400 hover:text-white transition-colors">Financeiro</a>
            <a href="/tarefas.html" class="text-slate-400 hover:text-white transition-colors">Tarefas</a>
            <a href="/metricas.html" class="text-slate-400 hover:text-white transition-colors">Métricas</a>
            <a href="/redes_sociais.html" class="text-slate-400 hover:text-white transition-colors">Redes Sociais</a>
            <a href="/storytelling.html" class="text-slate-400 hover:text-white transition-colors">Storytelling</a>
            <a href="/base_conhecimento.html" class="text-slate-400 hover:text-white transition-colors">Conhecimento</a>
            <a href="/portal_cliente.html" class="text-slate-400 hover:text-white transition-colors">Portal do Cliente</a>
            <button id="btnSair" class="text-slate-400 hover:text-white transition-colors font-bold">Sair</button>
        </div>
    </header>
    `;

    const newContent = content.replace(/<header[\s\S]*?<\/header>/i, newHeader);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Header atualizado em: ${file}`);
});
