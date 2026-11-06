const fs = require('fs');
const path = require('path');

const pastaPublic = path.join(__dirname, 'public');

const arquivos = [
    'admin.html', 'clientes.html', 'leads.html', 'prospects.html', 'campanhas.html',
    'mapeamento_cliente.html', 'planejamento.html', 'financeiro.html', 'trafego_pago.html',
    'tarefas.html', 'metricas_sistema.html', 'metricas.html', 'calculadora-trafego.html',
    'redes_sociais.html', 'storytelling.html', 'base_conhecimento.html', 'produtos.html',
    'inbound.html', 'outbound.html', 'criativos.html', 'propostas.html', 'portal_cliente.html', 'briefings.html'
];

// MENU GLOBAL COM TODAS AS PÁGINAS
const menuGlobal = `
    <header class="bg-slate-900 border-b border-slate-800 p-4 flex flex-wrap justify-between items-center gap-4">
        <div class="flex items-center gap-3">
            <img src="/logo.png" alt="Reverse Marketing" class="h-8 w-auto object-contain">
            <h1 class="text-xl font-bold">Reverse Marketing</h1>
        </div>
        <div class="flex flex-wrap items-center gap-4 text-sm">
            <a href="/admin.html" class="text-slate-400 hover:text-white transition-colors">Dashboard</a>
            <a href="/leads.html" class="text-slate-400 hover:text-white transition-colors">Leads</a>
            <a href="/clientes.html" class="text-slate-400 hover:text-white transition-colors">Clientes</a>
            <a href="/mapeamento_cliente.html" class="text-slate-400 hover:text-white transition-colors">Mapeamento</a>
            <a href="/produtos.html" class="text-slate-400 hover:text-white transition-colors">Produtos</a>
            <a href="/propostas.html" class="text-slate-400 hover:text-white transition-colors">Propostas</a>
            <a href="/criativos.html" class="text-slate-400 hover:text-white transition-colors">Criativos</a>
            <a href="/briefings.html" class="text-slate-400 hover:text-white transition-colors">Briefings</a>
            <a href="/planejamento.html" class="text-slate-400 hover:text-white transition-colors">Planejamento</a>
            <a href="/prospects.html" class="text-slate-400 hover:text-white transition-colors">Prospects</a>
            <a href="/campanhas.html" class="text-slate-400 hover:text-white transition-colors">Campanhas</a>
            <a href="/inbound.html" class="text-slate-400 hover:text-white transition-colors">Inbound</a>
            <a href="/outbound.html" class="text-slate-400 hover:text-white transition-colors">Outbound</a>
            <a href="/financeiro.html" class="text-slate-400 hover:text-white transition-colors">Financeiro</a>
            <a href="/trafego_pago.html" class="text-slate-400 hover:text-white transition-colors">Tráfego Pago</a>
            <a href="/tarefas.html" class="text-slate-400 hover:text-white transition-colors">Tarefas</a>
            <a href="/metricas_sistema.html" class="text-slate-400 hover:text-white transition-colors">Métricas do Sistema</a>
            <a href="/metricas.html" class="text-slate-400 hover:text-white transition-colors">Métricas de Tráfego</a>
            <a href="/calculadora-trafego.html" class="text-slate-400 hover:text-white transition-colors">Calculadora</a>
            <a href="/redes_sociais.html" class="text-slate-400 hover:text-white transition-colors">Redes Sociais</a>
            <a href="/storytelling.html" class="text-slate-400 hover:text-white transition-colors">Storytelling</a>
            <a href="/base_conhecimento.html" class="text-slate-400 hover:text-white transition-colors">Conhecimento</a>
            <a href="/portal_cliente.html" class="text-slate-400 hover:text-white transition-colors">Portal do Cliente</a>
            <button id="btnSair" class="bg-slate-800 hover:bg-red-600 text-white font-bold py-1 px-3 rounded transition-colors ml-2">Sair</button>
        </div>
    </header>
`;

arquivos.forEach(arquivo => {
    const caminho = path.join(pastaPublic, arquivo);
    if (fs.existsSync(caminho)) {
        let conteudo = fs.readFileSync(caminho, 'utf8');
        const regexHeader = /<header[\s\S]*?<\/header>/i;
        if (conteudo.match(regexHeader)) {
            conteudo = conteudo.replace(regexHeader, menuGlobal);
            fs.writeFileSync(caminho, conteudo, 'utf8');
            console.log(`✅ Menu atualizado em: ${arquivo}`);
        }
    }
});
console.log("🚀 Finalizado! Todas as páginas foram atualizadas com o menu completo.");