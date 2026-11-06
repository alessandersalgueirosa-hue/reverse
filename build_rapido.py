import os
from pathlib import Path

print("⏳ 1. Criando o arquivo .dockerignore...")
# Diz ao Docker para ignorar pastas pesadas
dockerignore_content = """node_modules
.git
_backups
_backup_calculadora_*
*.log
"""
Path(".dockerignore").write_text(dockerignore_content, encoding="utf-8")
print("✅ .dockerignore criado com sucesso!")

print("\n⏳ 2. Reconstruindo o Docker (agora será super rápido)...")
os.system("docker compose up -d --build")

print("\n✅ Pronto! O servidor foi reconstruído e ligado.")