from pathlib import Path
import re

arquivo = Path("public/admin.html")
if not arquivo.exists():
    arquivo = Path("admin.html")

if arquivo.exists():
    texto = arquivo.read_text(encoding="utf-8-sig")

    # Busca o trecho exato do card do outbound no JS
    padrao = r'<div class="flex justify-between items-start mb-2">\s*<div>\s*<span class="bg-slate-900 text-blue-400 text-xs px-2 py-1 rounded border border-slate-600 font-bold">\$\{a\.cliente_nome \|\| \'Sem Cliente\'\}</span>\s*</div>\s*<span class="text-xs text-slate-500 font-bold">\$\{a\.canal\}</span>\s*</div>'
    
    # Novo trecho com flex ajustado e truncate
    novo_html = '''<div class="flex justify-between items-start mb-2 gap-2 w-full">
                        <div class="flex-1 min-w-0">
                            <span class="bg-slate-900 text-blue-400 text-xs px-2 py-1 rounded border border-slate-600 font-bold block truncate" title="${a.cliente_nome || 'Sem Cliente'}">${a.cliente_nome || 'Sem Cliente'}</span>
                        </div>
                        <span class="text-xs text-slate-500 font-bold whitespace-nowrap">${a.canal}</span>
                    </div>'''

    # Substitui usando Regex para ignorar espaços em branco
    novo_texto, n = re.subn(padrao, novo_html, texto)

    if n > 0:
        arquivo.write_text(novo_texto, encoding="utf-8-sig")
        print(f"✅ Layout do Outbound corrigido com sucesso! ({n} substituição(ões) feita(s))")
    else:
        print("⚠️ Trecho não encontrado. O código pode já ter sido alterado ou está em formato diferente.")
else:
    print("❌ Arquivo admin.html não encontrado.")