import os
from pathlib import Path

# Pasta onde estão os HTMLs
public_dir = Path("public")
arquivos_html = list(public_dir.rglob("*.html"))

print(f"Buscando menus em {len(arquivos_html)} arquivos...")

for arquivo in arquivos_html:
    try:
        # Lê o arquivo mantendo os acentos corretos
        texto = arquivo.read_text(encoding="utf-8-sig")
        
        # Se o link do planejamento já existe, pula
        if 'href="/planejamento.html"' in texto:
            print(f"✅ Já tem: {arquivo.name}")
            continue

        # O código do novo link
        link_planejamento = '            <a href="/planejamento.html" class="text-slate-400 hover:text-white transition-colors">Planejamento</a>\n'
        
        # Tenta inserir logo depois do link de Mapeamento
        if 'href="/mapeamento_cliente.html"' in texto:
            # Encontra a linha do mapeamento e insere o planejamento depois
            texto = texto.replace(
                '<a href="/mapeamento_cliente.html" class="text-slate-400 hover:text-white transition-colors">Mapeamento</a>',
                '<a href="/mapeamento_cliente.html" class="text-slate-400 hover:text-white transition-colors">Mapeamento</a>\n' + link_planejamento
            )
            arquivo.write_text(texto, encoding="utf-8-sig")
            print(f"✅ Link inserido: {arquivo.name}")
            
        # Se não tiver mapeamento, tenta inserir antes do botão Sair
        elif 'id="btnSair"' in texto:
            texto = texto.replace(
                '<button id="btnSair"',
                link_planejamento + '            <button id="btnSair"'
            )
            arquivo.write_text(texto, encoding="utf-8-sig")
            print(f"✅ Link inserido antes do Sair: {arquivo.name}")
            
    except Exception as e:
        print(f"❌ Erro no arquivo {arquivo.name}: {e}")

print("\nPronto! Todos os menus foram atualizados.")