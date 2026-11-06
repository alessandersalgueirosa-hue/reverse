const fs = require('fs');
const path = require('path');

const pastaPublic = path.join(__dirname, 'public');

const arquivos = [
    'admin.html', 'clientes.html', 'leads.html', 'prospects.html', 'campanhas.html',
    'mapeamento_cliente.html', 'planejamento.html', 'financeiro.html', 'trafego_pago.html',
    'tarefas.html', 'metricas_sistema.html', 'metricas.html', 'calculadora-trafego.html',
    'redes_sociais.html', 'storytelling.html', 'base_conhecimento.html', 'produtos.html',
    'inbound.html', 'outbound.html', 'criativos.html', 'propostas.html', 'portal_cliente.html', 
    'briefings.html', 'branding.html', 'lista_brandings.html', 'calendario_editorial.html'
];

// O MENU DROPDOWN ATUALIZADO
const menuDropdown = `
    <header class="bg-slate-900 border-b border-slate-800 p-4 relative z-50">
        <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <div class="flex items-center gap-3">
                <img src="/logo.png" alt="Reverse Marketing" class="h-8 w-auto object-contain">
                <h1 class="text-xl font-bold">Reverse Marketing</h1>
            </div>

            <nav class="flex flex-wrap items-center gap-1 text-sm text-slate-300">
                <a href="/admin.html" class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors">Dashboard</a>
                
                <!-- Comercial -->
                <div class="relative group">
                    <button class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1">
                        Comercial <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                        <a href="/leads.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Leads</a>
                        <a href="/prospects.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Prospects</a>
                        <a href="/clientes.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Clientes</a>
                    </div>
                </div>

                <!-- Operação -->
                <div class="relative group">
                    <button class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1">
                        Operação <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                        <a href="/mapeamento_cliente.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Mapeamento</a>
                        <a href="/branding.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Branding</a>
                        <a href="/lista_brandings.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Brand Books</a>
                        <a href="/planejamento.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Planejamento</a>
                        <a href="/campanhas.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Campanhas</a>
                        <a href="/tarefas.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Tarefas</a>
                    </div>
                </div>

                <!-- Execução -->
                <div class="relative group">
                    <button class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1">
                        Execução <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                        <a href="/inbound.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Inbound</a>
                        <a href="/outbound.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Outbound</a>
                        <a href="/trafego_pago.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Tráfego Pago</a>
                        <a href="/redes_sociais.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Redes Sociais</a>
                        <a href="/storytelling.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Storytelling</a>
                        <a href="/criativos.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Criativos</a>
                        <a href="/calendario_editorial.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Calendário Editorial</a>
                        <a href="/briefings.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Briefings</a>
                    </div>
                </div>

                <!-- Gestão -->
                <div class="relative group">
                    <button class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1">
                        Gestão <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                        <a href="/financeiro.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Financeiro</a>
                        <a href="/propostas.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Propostas</a>
                        <a href="/produtos.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Produtos</a>
                    </div>
                </div>

                <!-- Inteligência -->
                <div class="relative group">
                    <button class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1">
                        Inteligência <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                        <a href="/metricas_sistema.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Métricas do Sistema</a>
                        <a href="/metricas.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Métricas de Tráfego</a>
                        <a href="/calculadora-trafego.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Calculadora</a>
                        <a href="/base_conhecimento.html" class="px-4 py-2 hover:bg-slate-700 text-white transition-colors">Conhecimento</a>
                    </div>
                </div>

                <!-- Portal -->
                <a href="/portal_cliente.html" class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors">Portal</a>
                
                <button id="btnSair" class="bg-slate-800 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded transition-colors ml-2">Sair</button>
            </nav>
        </div>
    </header>
`;

arquivos.forEach(arquivo => {
    const caminho = path.join(pastaPublic, arquivo);
    if (fs.existsSync(caminho)) {
        let conteudo = fs.readFileSync(caminho, 'utf8');
        const regexHeader = /<header[\s\S]*?<\/header>/i;
        if (conteudo.match(regexHeader)) {
            conteudo = conteudo.replace(regexHeader, menuDropdown);
            fs.writeFileSync(caminho, conteudo, 'utf8');
            console.log(`✅ Menu atualizado em: ${arquivo}`);
        }
    }
});
console.log("🚀 Finalizado! Menu Dropdown atualizado com Calendário Editorial.");