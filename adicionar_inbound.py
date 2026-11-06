from pathlib import Path

arquivo = Path("public/admin.html")
if not arquivo.exists():
    arquivo = Path("admin.html")

if arquivo.exists():
    texto = arquivo.read_text(encoding="utf-8-sig")

    # 1. Ajuste no HTML (Coloca o Inbound embaixo do Outbound na coluna da esquerda)
    html_antigo = """        <!-- Layout de 2 Colunas: Outbound e Calendário -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            <!-- Observações do Outbound -->
            <div>
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h2 class="text-2xl font-extrabold text-orange-400">Observações do Outbound</h2>
                        <p class="text-slate-400 text-sm">Acompanhamento de prospecção ativa por cliente.</p>
                    </div>
                    <a href="/outbound.html" class="text-sm text-orange-500 hover:text-orange-400 font-bold transition-colors">Gerenciar Outbound →</a>
                </div>
                <div id="listaOutbound" class="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-4 h-[400px] overflow-y-auto">
                    <p class="text-slate-400">Carregando observações...</p>
                </div>
            </div>"""

    html_novo = """        <!-- Layout de 2 Colunas: Outbound/Inbound e Calendário -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            <!-- Coluna da Esquerda: Outbound e Inbound -->
            <div class="flex flex-col gap-8">
                <!-- Observações do Outbound -->
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <h2 class="text-2xl font-extrabold text-orange-400">Observações do Outbound</h2>
                            <p class="text-slate-400 text-sm">Acompanhamento de prospecção ativa por cliente.</p>
                        </div>
                        <a href="/outbound.html" class="text-sm text-orange-500 hover:text-orange-400 font-bold transition-colors">Gerenciar Outbound →</a>
                    </div>
                    <div id="listaOutbound" class="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-4 h-[400px] overflow-y-auto">
                        <p class="text-slate-400">Carregando observações...</p>
                    </div>
                </div>

                <!-- Inbound Marketing -->
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <h2 class="text-2xl font-extrabold text-blue-400">Ações de Inbound</h2>
                            <p class="text-slate-400 text-sm">Conteúdos e estratégias de atração.</p>
                        </div>
                        <a href="/inbound.html" class="text-sm text-blue-500 hover:text-blue-400 font-bold transition-colors">Gerenciar Inbound →</a>
                    </div>
                    <div id="listaInbound" class="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-4 h-[400px] overflow-y-auto">
                        <p class="text-slate-400">Carregando ações...</p>
                    </div>
                </div>
            </div>"""

    if html_antigo in texto:
        texto = texto.replace(html_antigo, html_novo)
        print("✅ Estrutura HTML atualizada (Inbound adicionado).")
    else:
        print("⚠️ Trecho do HTML não encontrado. Pode já ter sido modificado.")

    # 2. Adicionar a chamada da API no JavaScript
    js_fetch_antigo = """            // 6. Outbound
            const outbound = await fetchAPI('/api/outbound');
            if (outbound) renderizarOutbound(outbound);"""
    
    js_fetch_novo = """            // 6. Outbound e Inbound
            const outbound = await fetchAPI('/api/outbound');
            if (outbound) renderizarOutbound(outbound);
            
            const inbound = await fetchAPI('/api/inbound');
            if (inbound) renderizarInbound(inbound);"""

    if js_fetch_antigo in texto:
        texto = texto.replace(js_fetch_antigo, js_fetch_novo)
        print("✅ Chamada da API de Inbound adicionada.")

    # 3. Adicionar a função de renderização do Inbound
    js_funcao = """        function renderizarInbound(acoes) {
            const div = document.getElementById('listaInbound');
            if (acoes.length === 0) {
                div.innerHTML = '<p class="text-slate-400">Nenhuma ação de inbound registrada.</p>';
                return;
            }
            acoes.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));

            div.innerHTML = `<div class="space-y-4">${acoes.map(a => `
                <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="bg-slate-900 text-blue-300 text-xs px-2 py-1 rounded border border-slate-600 font-bold">${a.cliente_nome || 'Sem Cliente'}</span>
                        </div>
                        <span class="text-xs text-slate-500 font-bold">${a.tipo_conteudo || 'Conteúdo'}</span>
                    </div>
                    <p class="text-sm font-bold text-white mt-2">${a.titulo || 'Sem título'}</p>
                    <p class="text-xs text-slate-400 mt-1 line-clamp-2">${a.descricao || ''}</p>
                    <div class="mt-3 flex justify-between items-center border-t border-slate-700 pt-2">
                        <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Etapa: ${a.etapa_funil || '-'}</span>
                        <span class="text-[10px] text-slate-500 font-bold uppercase">${a.status || '-'}</span>
                    </div>
                </div>
            `).join('')}</div>`;
        }

        function renderizarLeads(leads) {"""

    if "function renderizarLeads(leads) {" in texto:
        texto = texto.replace("function renderizarLeads(leads) {", js_funcao)
        print("✅ Função de renderização de Inbound injetada.")

    arquivo.write_text(texto, encoding="utf-8-sig")
    print("🚀 Tudo concluído! O Dashboard agora tem o Inbound.")
else:
    print("❌ Arquivo admin.html não encontrado.")