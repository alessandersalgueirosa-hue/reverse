from pathlib import Path
import re

arquivo = Path("public/admin.html")
if not arquivo.exists():
    arquivo = Path("admin.html")

if arquivo.exists():
    texto = arquivo.read_text(encoding="utf-8-sig")
    
    # 1. Remover o bloco de CSS antigo que usava @apply
    texto = re.sub(r"<style>[\s\S]*?\.calendario-dia[\s\S]*?</style>", "", texto)
    
    # 2. Substituir a função renderizarCalendario por uma versão com classes diretas e comparação de data segura
    nova_funcao = """function renderizarCalendario() {
            const grid = document.getElementById('gridCalendario');
            const mesAnoTexto = document.getElementById('mesAnoAtual');
            const filtroCliente = document.getElementById('filtroClienteCalendario').value;

            grid.innerHTML = '';
            mesAnoTexto.textContent = `${meses[mesAtual]} ${anoAtual}`;

            const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
            const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
            
            const tarefasFiltradas = todasAsTarefas.filter(t => {
                if (filtroCliente === 'todos') return true;
                return t.cliente_id == filtroCliente;
            });

            for (let i = 0; i < primeiroDia; i++) {
                grid.innerHTML += `<div></div>`;
            }

            for (let dia = 1; dia <= diasNoMes; dia++) {
                const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                
                // Comparação de data segura (ignora fuso horário)
                const temTarefa = tarefasFiltradas.some(t => {
                    if (!t.data_vencimento) return false;
                    const dataTarefa = String(t.data_vencimento).split('T')[0];
                    return dataTarefa === dataStr;
                });
                
                const hoje = new Date();
                const isHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear();

                // Classes do Tailwind aplicadas diretamente
                let classes = "flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors hover:bg-slate-700 ";
                if (temTarefa) {
                    classes += "bg-orange-500 font-bold text-white hover:bg-orange-600 ";
                } else if (isHoje) {
                    classes += "border border-orange-500 text-orange-400 ";
                }

                grid.innerHTML += `<div class="${classes}" onclick="abrirModal('${dataStr}')">${dia}</div>`;
            }
        }"""

    # Encontra a função antiga e substitui pela nova
    texto = re.sub(r"function renderizarCalendario\(\) \{[\s\S]*?grid\.innerHTML \+= `<div class=\"\$\{classes\}\" onclick=\"abrirModal\('\$\{dataStr\}'\)\">\$\{dia\}</div>`;\n            \}\n        \}", nova_funcao, texto)
    
    arquivo.write_text(texto, encoding="utf-8-sig")
    print("✅ Código do calendário e CSS corrigidos com sucesso!")
else:
    print("❌ Arquivo admin.html não encontrado.")