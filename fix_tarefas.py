import re

try:
    with open("server.js", "r", encoding="utf-8-sig") as f:
        codigo = f.read()

    # Expressão para achar a query da rota de tarefas
    padrao = r"SELECT t\.\*,\s*l\.nome AS lead_nome(?:,\s*c\.nome AS cliente_nome,\s*c\.id AS cliente_id)?\s*FROM tarefas t\s*LEFT JOIN leads l ON l\.id = t\.lead_id(?:\s*LEFT JOIN clientes c ON c\.id = l\.cliente_id)?\s*ORDER BY"
    
    # Query correta que traz o cliente_id
    query_nova = "SELECT t.*, l.nome AS lead_nome, c.nome AS cliente_nome, c.id AS cliente_id FROM tarefas t LEFT JOIN leads l ON l.id = t.lead_id LEFT JOIN clientes c ON c.id = l.cliente_id ORDER BY"

    if re.search(padrao, codigo):
        codigo = re.sub(padrao, query_nova, codigo)
        with open("server.js", "w", encoding="utf-8-sig") as f:
            f.write(codigo)
        print("✅ Query do server.js atualizada com sucesso (cliente_id incluído)!")
    else:
        print("⚠️ O trecho não foi encontrado. Talvez a query esteja diferente do esperado.")
        # Fallback: procura a string exata do arquivo antigo
        antigo = "SELECT t.*, l.nome AS lead_nome FROM tarefas t LEFT JOIN leads l ON l.id = t.lead_id ORDER BY t.concluida ASC, t.data_vencimento ASC NULLS LAST, t.data_criacao DESC"
        novo = "SELECT t.*, l.nome AS lead_nome, c.nome AS cliente_nome, c.id AS cliente_id FROM tarefas t LEFT JOIN leads l ON l.id = t.lead_id LEFT JOIN clientes c ON c.id = l.cliente_id ORDER BY t.concluida ASC, t.data_vencimento ASC NULLS LAST, t.data_criacao DESC"
        
        if antigo in codigo:
            codigo = codigo.replace(antigo, novo)
            with open("server.js", "w", encoding="utf-8-sig") as f:
                f.write(codigo)
            print("✅ Query antiga substituída com sucesso (cliente_id incluído)!")
        else:
            print("❌ Não foi possível encontrar a query de tarefas no server.js.")
except Exception as e:
    print(f"Erro: {e}")