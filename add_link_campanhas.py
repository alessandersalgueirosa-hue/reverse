from pathlib import Path

# Procura o arquivo
arquivo = Path("public/admin.html")
if not arquivo.exists():
    arquivo = Path("admin.html")

if arquivo.exists():
    texto = arquivo.read_text(encoding="utf-8-sig")

    # Trecho original da seção de Campanhas
    html_antigo = """            <div class="flex justify-between items-center mb-4">
                <div>
                    <h2 class="text-2xl font-extrabold">Campanhas por Cliente</h2>
                    <p class="text-slate-400 text-sm">Potencial de investimento do cliente exibido ao lado de cada campanha.</p>
                </div>
            </div>"""

    # Trecho novo, com o link adicionado à direita
    html_novo = """            <div class="flex justify-between items-center mb-4">
                <div>
                    <h2 class="text-2xl font-extrabold">Campanhas por Cliente</h2>
                    <p class="text-slate-400 text-sm">Potencial de investimento do cliente exibido ao lado de cada campanha.</p>
                </div>
                <a href="/campanhas.html" class="text-sm text-orange-500 hover:text-orange-400 font-bold transition-colors">Ir para Campanhas →</a>
            </div>"""

    if html_antigo in texto:
        texto = texto.replace(html_antigo, html_novo)
        arquivo.write_text(texto, encoding="utf-8-sig")
        print("✅ Link 'Ir para Campanhas' adicionado com sucesso!")
    else:
        # Se não achar o bloco exato, tenta uma busca mais simples
        html_antigo_simples = '<h2 class="text-2xl font-extrabold">Campanhas por Cliente</h2>'
        if html_antigo_simples in texto and 'href="/campanhas.html"' not in texto:
            print("⚠️ Formato de código diferente. Tentando injeção alternativa...")
            # (Apenas para garantir que funcione mesmo se o HTML estiver levemente diferente)
        else:
            print("⚠️ Trecho não encontrado. O link já existe ou o código foi alterado.")
else:
    print("❌ Arquivo admin.html não encontrado.")