from pathlib import Path
import os

print("⏳ 1. Atualizando o Backend (server.js)...")
server_path = Path("server.js")
if server_path.exists():
    conteudo = server_path.read_text(encoding="utf-8-sig")
    
    rota_funil = """
app.get('/api/metricas/funil', verificarToken, async (req, res) => {
    const clienteId = req.query.cliente_id || 'todos';
    try {
        let query = 'SELECT status, COUNT(*) as total FROM leads ';
        let params = [];
        if (clienteId !== 'todos') {
            query += 'WHERE cliente_id = $1 ';
            params.push(clienteId);
        }
        query += "GROUP BY status";
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar funil' });
    }
});

app.listen(PORT,"""
    
    if "api/metricas/funil" not in conteudo:
        conteudo = conteudo.replace("app.listen(PORT,", rota_funil)
        server_path.write_text(conteudo, encoding="utf-8-sig")
        print("   ✅ Rota do Funil adicionada ao server.js!")
    else:
        print("   ⚠️ Rota do Funil já existe no server.js.")

print("\n⏳ 2. Atualizando a página de Métricas (metricas_sistema.html)...")
html_path = Path("public/metricas_sistema.html")
if not html_path.exists():
    html_path = Path("metricas_sistema.html")

if html_path.exists():
    html = html_path.read_text(encoding="utf-8-sig")

    # Inserir o card do gráfico
    if "graficoFunil" not in html:
        bloco_html = """
            <!-- Gráfico de Funil -->
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800 shadow-lg mt-8 col-span-1 md:col-span-2">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h2 class="text-lg font-bold text-orange-400">Funil de Marketing por Cliente</h2>
                        <p class="text-sm text-slate-400">Acompanhe visualmente a conversão dos leads.</p>
                    </div>
                    <select id="filtroClienteFunil" class="bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-orange-500">
                        <option value="todos">Todos os Clientes</option>
                    </select>
                </div>
                <div class="relative h-80 w-full flex justify-center">
                    <canvas id="graficoFunil"></canvas>
                </div>
            </div>
        """
        html = html.replace("</main>", bloco_html + "\n</main>")
        print("   ✅ Bloco HTML do Funil adicionado!")

    # Inserir a lógica do JavaScript
    if "carregarFunil" not in html:
        bloco_js = """
            // --- CÓDIGO DO FUNIL DE MARKETING ---
            const selectFunil = document.getElementById('filtroClienteFunil');
            let chartFunil = null;

            const resClientesFunil = await fetchAPI('/api/clientes') || [];
            resClientesFunil.forEach(c => {
                selectFunil.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
            });

            async function carregarFunil() {
                const clienteId = selectFunil.value;
                const dados = await fetchAPI('/api/metricas/funil?cliente_id=' + clienteId) || [];

                const labels = ['Novos', 'Em Atendimento', 'Atendidos', 'Convertidos'];
                const mapStatus = { 'novo': 0, 'em_atendimento': 1, 'atendido': 2, 'convertido': 3 };
                const valores = [0, 0, 0, 0];

                dados.forEach(d => {
                    let index = mapStatus[d.status];
                    if (index !== undefined) valores[index] = parseInt(d.total);
                });

                if (chartFunil) chartFunil.destroy();

                chartFunil = new Chart(document.getElementById('graficoFunil'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Quantidade de Leads',
                            data: valores,
                            backgroundColor: ['#3b82f6', '#eab308', '#22c55e', '#f97316'],
                            borderRadius: 6
                        }]
                    },
                    options: {
                        indexAxis: 'y', // Deixa as barras horizontais
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { beginAtZero: true, ticks: { stepSize: 1 } }
                        }
                    }
                });
            }

            selectFunil.addEventListener('change', carregarFunil);
            carregarFunil();
            // --- FIM DO FUNIL ---
        """
        
        # Injeta o JS antes do fechamento do DOMContentLoaded
        html = html.replace("        });\n    </script>", bloco_js + "\n        });\n    </script>")
        print("   ✅ Código JavaScript do Funil injetado!")

    html_path.write_text(html, encoding="utf-8-sig")
    print("   ✅ Página metricas_sistema.html atualizada!")
else:
    print("   ❌ Arquivo metricas_sistema.html não encontrado.")

print("\n⏳ 3. Reiniciando o Docker...")
os.system("docker compose restart")
print("\n✅ Tudo pronto! Acesse 'Métricas do Sistema' no menu e veja o gráfico.")