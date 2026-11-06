from pathlib import Path

# Procura o admin.html na pasta public ou na raiz
arquivo = Path("public/admin.html")
if not arquivo.exists():
    arquivo = Path("admin.html")

if arquivo.exists():
    texto = arquivo.read_text(encoding="utf-8-sig")
    
    # 1. Corrige a bolinha laranja (verifica se a data "começa com" o dia)
    antigo1 = "const temTarefa = tarefasFiltradas.some(t => t.data_vencimento === dataStr);"
    novo1 = "const temTarefa = tarefasFiltradas.some(t => t.data_vencimento && String(t.data_vencimento).startsWith(dataStr));"
    texto = texto.replace(antigo1, novo1)
    
    # 2. Corrige a abertura do modal
    antigo2 = "const matchData = t.data_vencimento === dataStr;"
    novo2 = "const matchData = t.data_vencimento && String(t.data_vencimento).startsWith(dataStr);"
    texto = texto.replace(antigo2, novo2)
    
    arquivo.write_text(texto, encoding="utf-8-sig")
    print("✅ Código do calendário corrigido com sucesso!")
else:
    print("❌ Arquivo admin.html não encontrado.")