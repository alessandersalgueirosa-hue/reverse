from pathlib import Path
import os

arquivo = Path("server.js")
if arquivo.exists():
    texto = arquivo.read_text(encoding="utf-8-sig")
    
    # A linha original que limita o tamanho
    antigo = "app.use(express.json());"
    # A nova linha liberando até 50MB (mais que suficiente para imagens em e-mails)
    novo = "app.use(express.json({ limit: '50mb' }));\napp.use(express.urlencoded({ limit: '50mb', extended: true }));"
    
    if antigo in texto:
        texto = texto.replace(antigo, novo)
        arquivo.write_text(texto, encoding="utf-8-sig")
        print("✅ Limite de tamanho do servidor aumentado para 50MB!")
    else:
        print("⚠️ Trecho não encontrado. O limite já pode ter sido alterado.")
        
    print("\n⏳ Reiniciando o Docker para aplicar...")
    os.system("docker compose restart")
    print("✅ Pronto! O servidor foi reiniciado.")
else:
    print("❌ Arquivo server.js não encontrado.")