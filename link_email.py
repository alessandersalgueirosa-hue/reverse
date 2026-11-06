from pathlib import Path
arquivo = Path("public/campanhas.html")
if arquivo.exists():
    texto = arquivo.read_text(encoding="utf-8-sig")
    link = '<a href="/campanhas_mail.html" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Disparo de E-mail</a>'
    
    # Insere ao lado do botão de Nova Campanha (ou no topo)
    if "Nova Campanha" in texto:
        texto = texto.replace(">Nova Campanha</", f">{link} <span class='ml-2'></span>Nova Campanha</")
        arquivo.write_text(texto, encoding="utf-8-sig")
        print("✅ Link de e-mail adicionado em campanhas.html!")