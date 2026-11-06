import os
arquivo = "server.js"

try:
    with open(arquivo, "r", encoding="utf-8-sig") as f:
        conteudo = f.read()

    antigo = "SELECT t.*, l.nome AS lead_nome FROM tarefas t LEFT JOIN leads l ON l.id = t.lead_id ORDER BY t.concluida ASC, t.data_vencimento ASC NULLS LAST, t.data_criacao DESC"
    novo = "SELECT t.*, l.nome AS lead_nome, c.nome AS cliente_nome, c.id AS cliente_id FROM tarefas t LEFT JOIN leads l ON l.id = t.lead_id LEFT JOIN clientes c ON c.id = l.cliente_id ORDER BY t.concluida ASC, t.data_vencimento ASC NULLS LAST, t.data_criacao DESC"

    if antigo in conteudo:
        conteudo = conteudo.replace(antigo, novo)
        with open(arquivo, "w", encoding="utf-8-sig") as f:
            f.write(conteudo)
        print("✅ server.js atualizado com sucesso!")
    else:
        print("⚠️ O trecho antigo não foi encontrado. Talvez já tenha sido atualizado.")
except Exception as e:
    print(f"❌ Erro: {e}")