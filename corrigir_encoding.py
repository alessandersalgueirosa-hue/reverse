#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
corrigir_encoding.py
Varre todos os arquivos .html do projeto, lê como UTF-8 e salva novamente 
com o BOM (Byte Order Mark) para forçar o navegador a ler os acentos corretamente.
"""
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
# Verifica se existe a pasta public, senão usa a raiz
public_dir = BASE / "public" if (BASE / "public").exists() else BASE

html_files = list(public_dir.rglob("*.html"))

if not html_files:
    print("Nenhum arquivo .html encontrado.")
    sys.exit(0)

print(f"Corrigindo encoding de {len(html_files)} arquivo(s)...\n")

for f in html_files:
    try:
        # Lê como UTF-8 (mesmo que já esteja correto)
        text = f.read_text(encoding="utf-8")
        # Regrava forçando UTF-8 com BOM (utf-8-sig)
        f.write_text(text, encoding="utf-8-sig")
        print(f"  [ok] {f.name}")
    except UnicodeDecodeError:
        # Se o arquivo já estiver corrompido em outro formato, tenta contornar
        print(f"  [!] {f.name} - Erro de leitura. Pulando...")
    except Exception as e:
        print(f"  [!] {f.name} - Erro: {e}")

print("\nPronto! Recarregue o navegador com Ctrl+F5 (ou Cmd+Shift+R no Mac).")