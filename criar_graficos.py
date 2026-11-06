#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent
PUBLIC_DIR = BASE / "public"

# HTML da nova página de Gráficos Completa
HTML_GRAFICOS = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Métricas do Sistema - Reverse Marketing</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-slate-950 text-white font-sans antialiased">

    <header class="bg-slate-900 border-b border-slate-800 p-4 flex flex-wrap justify-between items-center gap-4">
        <div class="flex items-center gap-3">
            <div class="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white">R</div>
            <h1 class="text-xl font-bold">Métricas do Sistema</h1>
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
            <a href="/trafego_pago.html" class="text-slate-400 hover:text-white transition-colors">Tráfego Pago</a>
            <a href="/tarefas.html" class="text-slate-400 hover:text-white transition-colors">Tarefas</a>
            
            <a href="/metricas_sistema.html" class="text-white font-bold border-b-2 border-orange-500 pb-1">Métricas do Sistema</a>
            <a href="/metricas.html" class="text-slate-400 hover:text-white transition-colors">Métricas de Tráfego</a>
            <a href="/calculadora-trafego.html" class="text-slate-400 hover:text-white transition-colors">Calculadora</a>
            
            <a href="/redes_sociais.html" class="text-slate-400 hover:text-white transition-colors">Redes Sociais</a>
            <a href="/storytelling.html" class="text-slate-400 hover:text-white transition-colors">Storytelling</a>
            <a href="/base_conhecimento.html" class="text-slate-400 hover:text-white transition-colors">Conhecimento</a>
            <a href="/portal_cliente.html" class="text-slate-400 hover:text-white transition-colors">Portal do Cliente</a>
            <button id="btnSair" onclick="localStorage.removeItem('token'); window.location.href='/login.html';" class="text-slate-400 hover:text-white transition-colors font-bold">Sair</button>
        </div>
    </header>

    <main class="max-w-7xl mx-auto p-8">
        <!-- Cards de KPI -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-lg text-center">
                <p class="text-slate-400 text-xs mb-1 uppercase font-bold">Total Leads</p>
                <p id="kpiTotalLeads" class="text-2xl font-bold text-white">0</p>
            </div>
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-lg text-center">
                <p class="text-yellow-400 text-xs mb-1 uppercase font-bold">Pendentes</p>
                <p id="kpiPendentes" class="text-2xl font-bold text-yellow-400">0</p>
            </div>
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-lg text-center">
                <p class="text-green-400 text-xs mb-1 uppercase font-bold">Atendidos</p>
                <p id="kpiAtendidos" class="text-2xl font-bold text-green-400">0</p>
            </div>
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-lg text-center">
                <p class="text-blue-400 text-xs mb-1 uppercase font-bold">Clientes</p>
                <p id="kpiClientes" class="text-2xl font-bold text-blue-400">0</p>
            </div>
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-lg text-center">
                <p class="text-purple-400 text-xs mb-1 uppercase font-bold">Prospects</p>
                <p id="kpiProspects" class="text-2xl font-bold text-purple-400">0</p>
            </div>
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-lg text-center">
                <p class="text-orange-400 text-xs mb-1 uppercase font-bold">Tarefas Pend.</p>
                <p id="kpiTarefas" class="text-2xl font-bold text-orange-400">0</p>
            </div>
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-lg text-center">
                <p class="text-pink-400 text-xs mb-1 uppercase font-bold">Campanhas Ativas</p>
                <p id="kpiCampanhas" class="text-2xl font-bold text-pink-400">0</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Gráfico de Leads -->
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800 shadow-lg">
                <h2 class="text-lg font-bold mb-4 text-orange-400">Funil de Leads</h2>
                <div class="relative h-64 w-full flex justify-center">
                    <canvas id="graficoLeads"></canvas>
                </div>
            </div>

            <!-- Gráfico de Clientes vs Prospects -->
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800 shadow-lg">
                <h2 class="text-lg font-bold mb-4 text-blue-400">Base de Contatos</h2>
                <div class="relative h-64 w-full flex justify-center">
                    <canvas id="graficoBase"></canvas>
                </div>
            </div>

            <!-- Gráfico de Tarefas -->
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800 shadow-lg">
                <h2 class="text-lg font-bold mb-4 text-purple-400">Status das Tarefas</h2>
                <div class="relative h-64 w-full flex justify-center">
                    <canvas id="graficoTarefas"></canvas>
                </div>
            </div>

            <!-- Gráfico de Campanhas -->
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800 shadow-lg">
                <h2 class="text-lg font-bold mb-4 text-pink-400">Status das Campanhas</h2>
                <div class="relative h-64 w-full flex justify-center">
                    <canvas id="graficoCampanhas"></canvas>
                </div>
            </div>
        </div>
    </main>

    <script>
        const token = localStorage.getItem('token');
        if (!token) window.location.href = '/login.html';

        async function fetchAPI(url) {
            try {
                const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!res.ok) throw new Error();
                return await res.json();
            } catch (e) { return null; }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            // Configuração global do Chart.js para tema escuro
            Chart.defaults.color = '#94a3b8';
            Chart.defaults.borderColor = '#334155';

            // 1. Buscar dados de todas as APIs
            const leads = await fetchAPI('/api/leads') || [];
            const metricas = await fetchAPI('/api/metricas') || { totalClientes: 0, totalProspects: 0 };
            const tarefas = await fetchAPI('/api/tarefas') || [];
            const campanhas = await fetchAPI('/api/campanhas') || [];

            // 2. Preencher os Cards de KPI (Topo)
            let pendentes = 0, atendidos = 0;
            leads.forEach(l => {
                if (l.status === 'novo' || l.status === 'em_atendimento') pendentes++;
                if (l.status === 'atendido' || l.status === 'convertido') atendidos++;
            });
            
            const tarefasPendentes = tarefas.filter(t => !t.concluida).length;
            const campanhasAtivas = campanhas.filter(c => c.status === 'ativa').length;

            document.getElementById('kpiTotalLeads').innerText = leads.length;
            document.getElementById('kpiPendentes').innerText = pendentes;
            document.getElementById('kpiAtendidos').innerText = atendidos;
            document.getElementById('kpiClientes').innerText = metricas.totalClientes || 0;
            document.getElementById('kpiProspects').innerText = metricas.totalProspects || 0;
            document.getElementById('kpiTarefas').innerText = tarefasPendentes;
            document.getElementById('kpiCampanhas').innerText = campanhasAtivas;

            // 3. Processar dados para os gráficos
            // Gráfico de Leads (Funil)
            let lNovos = 0, lAtendimento = 0, lAtendidos = 0, lConvertidos = 0;
            leads.forEach(l => {
                if (l.status === 'novo') lNovos++;
                else if (l.status === 'em_atendimento') lAtendimento++;
                else if (l.status === 'atendido') lAtendidos++;
                else if (l.status === 'convertido') lConvertidos++;
            });

            new Chart(document.getElementById('graficoLeads'), {
                type: 'doughnut',
                data: {
                    labels: ['Novos', 'Em Atendimento', 'Atendidos', 'Convertidos'],
                    datasets: [{ data: [lNovos, lAtendimento, lAtendidos, lConvertidos], backgroundColor: ['#3b82f6', '#eab308', '#22c55e', '#f97316'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });

            // Gráfico Clientes vs Prospects
            new Chart(document.getElementById('graficoBase'), {
                type: 'bar',
                data: {
                    labels: ['Clientes Ativos', 'Prospects'],
                    datasets: [{ label: 'Quantidade', data: [metricas.totalClientes || 0, metricas.totalProspects || 0], backgroundColor: ['#3b82f6', '#a855f7'], borderRadius: 6 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
            });

            // Gráfico de Tarefas
            new Chart(document.getElementById('graficoTarefas'), {
                type: 'doughnut',
                data: {
                    labels: ['Pendentes', 'Concluídas'],
                    datasets: [{ data: [tarefasPendentes, tarefas.length - tarefasPendentes], backgroundColor: ['#f97316', '#22c55e'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });

            // Gráfico de Campanhas
            let cAtivas = 0, cPausadas = 0, cEncerradas = 0;
            campanhas.forEach(c => {
                if (c.status === 'ativa') cAtivas++;
                else if (c.status === 'pausada') cPausadas++;
                else if (c.status === 'encerrada') cEncerradas++;
            });

            new Chart(document.getElementById('graficoCampanhas'), {
                type: 'doughnut',
                data: {
                    labels: ['Ativas', 'Pausadas', 'Encerradas'],
                    datasets: [{ data: [cAtivas, cPausadas, cEncerradas], backgroundColor: ['#22c55e', '#eab308', '#ef4444'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        });
    </script>
</body>
</html>
"""

def atualizar_menus():
    html_files = list(PUBLIC_DIR.rglob("*.html"))
    for f in html_files:
        if f.name == 'metricas_sistema.html': continue 
        
        text = f.read_text(encoding="utf-8-sig")
        original = text

        padrao = re.compile(
            r'(<a href="/tarefas\.html"[^>]*>Tarefas</a>)\s*.*?\s*(<a href="/redes_sociais\.html")',
            re.IGNORECASE | re.DOTALL
        )

        novo_menu = r'''\1
            <a href="/metricas_sistema.html" class="text-slate-400 hover:text-white transition-colors">Métricas do Sistema</a>
            <a href="/metricas.html" class="text-slate-400 hover:text-white transition-colors">Métricas de Tráfego</a>
            <a href="/calculadora-trafego.html" class="text-slate-400 hover:text-white transition-colors">Calculadora</a>
            \2'''

        text = padrao.sub(novo_menu, text)
        text = re.sub(r'<a href="/metricas\.html"[^>]*>Métricas</a>\s*', '', text)
        text = re.sub(r'<a href="/calculadora-trafego\.html"[^>]*>Calculadora de Tráfego</a>\s*', '', text)

        if text != original:
            f.write_text(text, encoding="utf-8-sig")

if __name__ == "__main__":
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    p_graficos = PUBLIC_DIR / "metricas_sistema.html"
    p_graficos.write_text(HTML_GRAFICOS, encoding="utf-8-sig")
    print("OK — metricas_sistema.html gerado com todos os KPIs e Gráficos.")
    atualizar_menus()
    print("Menus atualizados em todo o sistema.")