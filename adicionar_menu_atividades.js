// adicionar_menu_atividades.js
const fs = require('fs');
const path = require('path');

const pastaPublic = path.join(__dirname, 'public');

const arquivos = [
    'admin.html', 'clientes.html', 'leads.html', 'prospects.html', 'campanhas.html',
    'mapeamento_cliente.html', 'planejamento.html', 'financeiro.html', 'trafego_pago.html',
    'tarefas.html', 'metricas_sistema.html', 'metricas.html', 'calculadora-trafego.html',
    'redes_sociais.html', 'storytelling.html', 'base_conhecimento.html', 'produtos.html',
    'inbound.html', 'outbound.html', 'criativos.html', 'propostas.html', 'portal_cliente.html',
    'briefings.html', 'branding.html', 'lista_brandings.html', 'calendario_editorial.html',
    'permissoes.html', 'configuracoes.html', 'atividades.html', 'timeline_cliente.html'
];

// MENU DO ADMIN (idêntico ao atual + 2 novos links em Operação)
const menuAdmin = `
    <header id="menu-admin" class="bg-slate-900 border-b border-slate-800 p-4 relative z-50 hidden">
        <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <div class="flex items-center gap-3">
                <img src="/logo.png" alt="Reverse Marketing" class="h-8 w-auto object-contain">
                <h1 class="text-xl font-bold">Reverse Marketing</h1>
            </div>
            <nav class="flex flex-wrap items-center gap-1 text-sm text-slate-300">
                <a href="/admin.html" class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors">Dashboard</a>

                <div class="relative group">
                    <button class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1">Comercial <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div class="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                        <a href="/leads.html" class="px-4 py-2 hover:bg-slate-700 text-white">Leads</a>
                        <a href="/prospects.html" class="px-4 py-2 hover:bg-slate-700 text-white">Prospects</a>
                        <a href="/clientes.html" class="px-4 py-2 hover:bg-slate-700 text-white">Clientes</a>
                        <a href="/permissoes.html" class="px-4 py-2 hover:bg-slate-700 text-white">Permissões</a>
                    </div>
                </div>

                <div class="relative group">
                    <button class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1">Operação <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div class="absolute left-0 top-full mt-1 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                        <a href="/mapeamento_cliente.html" class="px-4 py-2 hover:bg-slate-700 text-white">Mapeamento</a>
                        <a href="/branding.html" class="px-4 py-2 hover:bg-slate-700 text-white">Branding</a>
                        <a href="/lista_brandings.html" class="px-4 py-2 hover:bg-slate-700 text-white">Brand Books</a>
                        <a href="/planejamento.html" class="px-4 py-2 hover:bg-slate-700 text-white">Planejamento</a>
                        <a href="/campanhas.html" class="px-4 py-2 hover:bg-slate-700 text-white">Campanhas</a>
                        <a href="/tarefas.html" class="px-4 py-2 hover:bg-slate-700 text-white">Tarefas</a>
                        <a href="/atividades.html" class="px-4 py-2 hover:bg-slate-700 text-white">📅 Atividades</a>
                        <a href="/timeline_cliente.html" class="px-4 py-2 hover:bg-slate-700 text-white">🕒 Timeline</a>
                    </div>
                </div>

                <div class="relative group">
                    <button class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1">Execução <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div class="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                        <a href="/inbound.html" class="px-4 py-2 hover:bg-slate-700 text-white">Inbound</a>
                        <a href="/outbound.html" class="px-4 py-2 hover:bg-slate-700 text-white">Outbound</a>
                        <a href="/trafego_pago.html" class="px-4 py-2 hover:bg-slate-700 text-white">Tráfego Pago</a>
                        <a href="/redes_sociais.html" class="px-4 py-2 hover:bg-slate-700 text-white">Redes Sociais</a>
                        <a href="/storytelling.html" class="px-4 py-2 hover:bg-slate-700 text-white">Storytelling</a>
                        <a href="/criativos.html" class="px-4 py-2 hover:bg-slate-700 text-white">Criativos</a>
                        <a href="/calendario_editorial.html" class="px-4 py-2 hover:bg-slate-700 text-white">Calendário Editorial</a>
                        <a href="/briefings.html" class="px-4 py-2 hover:bg-slate-700 text-white">Briefings</a>
                    </div>
                </div>

                <div class="relative group">
                    <button class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1">Gestão <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div class="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                        <a href="/financeiro.html" class="px-4 py-2 hover:bg-slate-700 text-white">Financeiro</a>
                        <a href="/propostas.html" class="px-4 py-2 hover:bg-slate-700 text-white">Propostas</a>
                        <a href="/produtos.html" class="px-4 py-2 hover:bg-slate-700 text-white">Produtos</a>
                        <a href="/configuracoes.html" class="px-4 py-2 hover:bg-slate-700 text-white">Configurações</a>
                    </div>
                </div>

                <div class="relative group">
                    <button class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1">Inteligência <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div class="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                        <a href="/metricas_sistema.html" class="px-4 py-2 hover:bg-slate-700 text-white">Métricas do Sistema</a>
                        <a href="/metricas.html" class="px-4 py-2 hover:bg-slate-700 text-white">Métricas de Tráfego</a>
                        <a href="/calculadora-trafego.html" class="px-4 py-2 hover:bg-slate-700 text-white">Calculadora</a>
                        <a href="/base_conhecimento.html" class="px-4 py-2 hover:bg-slate-700 text-white">Conhecimento</a>
                    </div>
                </div>

                <a href="/portal_cliente.html" class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors">Portal</a>
                <button class="btn-sair bg-slate-800 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded transition-colors ml-2">Sair</button>
            </nav>
        </div>
    </header>
`;

// MENU DO CLIENTE (idêntico ao atual)
const menuCliente = `
    <header id="menu-cliente" class="bg-slate-900 border-b border-slate-800 p-4 relative z-50 hidden">
        <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <div class="flex items-center gap-3">
                <img src="/logo.png" alt="Reverse Marketing" class="h-8 w-auto object-contain">
                <h1 class="text-xl font-bold">Área do Cliente</h1>
            </div>
            <nav id="nav-cliente" class="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <a href="/portal_cliente.html" class="px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors font-bold text-orange-500">Meu Portal</a>
                <button class="btn-sair bg-slate-800 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded transition-colors ml-2">Sair</button>
            </nav>
        </div>
    </header>
`;

arquivos.forEach(arquivo => {
    const caminho = path.join(pastaPublic, arquivo);

    if (!fs.existsSync(caminho)) {
        console.log(`⏭️  Pulado (não existe): ${arquivo}`);
        return;
    }

    let conteudo = fs.readFileSync(caminho, 'utf8');

    // Remove headers antigos (evita duplicação)
    conteudo = conteudo.replace(/<header[\s\S]*?<\/header>/gi, '');

    // Remove scripts antigos de menu (se houver)
    conteudo = conteudo.replace(/<script>\s*\(function\(\)\s*\{\s*const token[\s\S]*?\}\)\(\);\s*<\/script>/gi, '');

    const scriptControle = `
        ${menuAdmin}
        ${menuCliente}
        <script>
            (function() {
                const token = localStorage.getItem('token');
                let isCliente = false;

                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        if (payload.tipo === 'cliente') isCliente = true;
                    } catch(e) {}
                }

                if (isCliente) {
                    const menuAdminEl = document.getElementById('menu-admin');
                    if (menuAdminEl) menuAdminEl.style.display = 'none';

                    const menuClienteEl = document.getElementById('menu-cliente');
                    if (menuClienteEl) menuClienteEl.classList.remove('hidden');

                    const permissoes = JSON.parse(localStorage.getItem('permissoes') || '{}');
                    const nav = document.getElementById('nav-cliente');
                    const btnSair = nav.querySelector('.btn-sair');

                    const addLink = (href, texto) => {
                        const a = document.createElement('a');
                        a.href = href;
                        a.className = 'px-3 py-2 rounded hover:bg-slate-800 hover:text-white transition-colors';
                        a.innerText = texto;
                        nav.insertBefore(a, btnSair);
                    };

                    if (permissoes.pode_ver_calendario) addLink('/calendario_editorial.html', 'Calendário');
                    if (permissoes.pode_ver_financeiro) addLink('/financeiro.html', 'Financeiro');
                    if (permissoes.pode_ver_metricas)   addLink('/metricas.html', 'Resultados');
                    if (permissoes.pode_ver_branding)   addLink('/lista_brandings.html', 'Minha Marca');
                    if (permissoes.pode_ver_campanhas)  addLink('/campanhas.html', 'Campanhas');
                    if (permissoes.pode_ver_propostas)  addLink('/propostas.html', 'Propostas');
                    if (permissoes.pode_ver_tarefas)    addLink('/tarefas.html', 'Minhas Tarefas');

                } else {
                    const menuClienteEl = document.getElementById('menu-cliente');
                    if (menuClienteEl) menuClienteEl.style.display = 'none';

                    const menuAdminEl = document.getElementById('menu-admin');
                    if (menuAdminEl) menuAdminEl.classList.remove('hidden');
                }

                document.querySelectorAll('.btn-sair').forEach(btn => {
                    btn.addEventListener('click', () => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('permissoes');
                        window.location.href = '/login.html';
                    });
                });
            })();
        </script>
    `;

    conteudo = conteudo.replace(/<body[^>]*>/i, `$&${scriptControle}`);

    // Bloqueio de segurança (adiciona atividades.html e timeline_cliente.html)
    const scriptBloqueio = `
        <script>
            (function() {
                const token = localStorage.getItem('token');
                if (!token) return;
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.tipo === 'cliente') {
                        const paginasAdmin = [
                            'financeiro.html', 'clientes.html', 'leads.html', 'prospects.html', 'campanhas.html',
                            'mapeamento_cliente.html', 'planejamento.html', 'trafego_pago.html',
                            'metricas_sistema.html', 'calculadora-trafego.html', 'redes_sociais.html',
                            'storytelling.html', 'base_conhecimento.html', 'produtos.html',
                            'inbound.html', 'outbound.html', 'criativos.html', 'propostas.html',
                            'branding.html', 'permissoes.html', 'configuracoes.html',
                            'atividades.html', 'timeline_cliente.html'
                        ];
                        const urlAtual = window.location.pathname.split('/').pop();
                        if (paginasAdmin.includes(urlAtual)) {
                            alert('Acesso negado. Esta área é restrita.');
                            window.location.href = '/portal_cliente.html';
                        }
                    }
                } catch(e) {}
            })();
        </script>
    `;

    conteudo = conteudo.replace('</body>', `${scriptBloqueio}</body>`);

    fs.writeFileSync(caminho, conteudo, 'utf8');
    console.log(`✅ Menu + Segurança aplicados em: ${arquivo}`);
});

console.log("🚀 Finalizado! Atividades e Timeline adicionados ao menu Admin + bloqueio de acesso para clientes.");