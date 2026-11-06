#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
atualizar_calculadora.py

- Renomeia public/metricas_trafego_pago.html -> public/calculadora-trafego.html
- Atualiza titulo/h1 do arquivo para "Calculadora de Trafego"
- Em todos os .html, troca o link quebrado /metricas.html por /calculadora-trafego.html
- Faz backup automatico antes de alterar qualquer arquivo.

Uso:
    py atualizar_calculadora.py
"""

import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

BASE = Path(__file__).resolve().parent
STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP_DIR = BASE / f"_backup_calculadora_{STAMP}"
SKIP_DIRS = {
    "node_modules", "vendor", ".git", "dist", "build",
    "venv", ".venv", "__pycache__", "_backup_calculadora_",
}

def read_text(path):
    return path.read_bytes().decode("utf-8-sig")

def write_preserving_bom(path, text):
    raw = path.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        path.write_bytes(b"\xef\xbb\xbf" + text.encode("utf-8"))
    else:
        path.write_text(text, encoding="utf-8")

def backup_file(path):
    dest = BACKUP_DIR / path.relative_to(BASE)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, dest)

def renomear_principal():
    old = BASE / "public" / "metricas_trafego_pago.html"
    new = BASE / "public" / "calculadora-trafego.html"

    if new.exists() and old.exists():
        print(f"  [aviso] Ambos existem. Mantive '{new.name}'. Apague '{old.name}' depois.")
        return new
    if new.exists():
        print(f"  [ok] '{new.name}' já existe.")
        return new
    if not old.exists():
        candidatos = [p for p in BASE.rglob("metricas_trafego_pago.html")
                      if not any(part in SKIP_DIRS for part in p.parts)]
        if not candidatos:
            print("  [!] Não encontrei 'metricas_trafego_pago.html' em lugar nenhum.")
            return None
        old = candidatos[0]
        new = old.with_name("calculadora-trafego.html")

    backup_file(old)
    shutil.move(str(old), str(new))
    print(f"  [ok] Renomeado: {old.relative_to(BASE)} -> {new.relative_to(BASE)}")
    return new

def atualizar_titulo(html_path):
    if not html_path or not html_path.exists():
        return
    text = read_text(html_path)
    original = text
    text = re.sub(
        r"<title>\s*M[ée]tricas\s+de\s+Tr[áa]fego\s+Pago\s*</title>",
        "<title>Calculadora de Tráfego</title>",
        text, flags=re.IGNORECASE,
    )
    text = re.sub(
        r"(<h1[^>]*>)\s*M[ée]tricas\s+de\s+Tr[áa]fego\s+Pago\s*(</h1>)",
        r"\1Calculadora de Tráfego\2",
        text, flags=re.IGNORECASE,
    )
    if text != original:
        backup_file(html_path)
        write_preserving_bom(html_path, text)
        print(f"  [ok] Título atualizado em {html_path.relative_to(BASE)}")

LINK_METRICAS = re.compile(
    r'<a href="/metricas\.html"([^>]*)>\s*M[ée]tricas(?:\s+de\s+Tr[áa]fego\s+Pago)?\s*</a>',
    re.IGNORECASE,
)
TRAFEGO_PAGO = re.compile(
    r'([ \t]*)(<a href="/trafego_pago\.html"([^>]*)>\s*Tr[áa]fego\s+Pago\s*</a>)',
    re.IGNORECASE,
)

def atualizar_menu(html_path):
    text = read_text(html_path)
    original = text
    mudancas = []

    def repl_link(m):
        return f'<a href="/calculadora-trafego.html"{m.group(1)}>Calculadora de Tráfego</a>'

    text, n = LINK_METRICAS.subn(repl_link, text)
    if n > 0:
        mudancas.append(f"{n} link(s) 'Métricas' -> 'Calculadora de Tráfego'")

    if "calculadora-trafego.html" not in text and "trafego_pago.html" in text:
        def insere_apos(m):
            indent = m.group(1)
            anchor_original = m.group(2)
            attrs = m.group(3)
            novo = f'<a href="/calculadora-trafego.html"{attrs}>Calculadora de Tráfego</a>'
            return f"{indent}{anchor_original}\n{indent}{novo}"
        text, n2 = TRAFEGO_PAGO.subn(insere_apos, text, count=1)
        if n2 > 0:
            mudancas.append("link inserido após 'Tráfego Pago'")

    if text != original:
        backup_file(html_path)
        write_preserving_bom(html_path, text)
        return mudancas
    return None

def main():
    print("=" * 62)
    print(" Atualizador -> Calculadora de Tráfego")
    print("=" * 62)
    print()

    print("[1/3] Renomeando arquivo principal...")
    html_principal = renomear_principal()
    print()

    print("[2/3] Atualizando título do HTML da calculadora...")
    atualizar_titulo(html_principal)
    print()

    print("[3/3] Atualizando menus em todos os arquivos .html...")
    arquivos = [p for p in BASE.rglob("*.html")
                if not any(part in SKIP_DIRS for part in p.parts)]

    if not arquivos:
        print("  [!] Nenhum .html encontrado. Rode este script na raiz do projeto.")
        return 1

    alterados, sem_menu, restos = 0, 0, 0
    for f in arquivos:
        resultado = atualizar_menu(f)
        if resultado:
            print(f"  [ok] {f.relative_to(BASE)}")
            for m in resultado:
                print(f"         - {m}")
            alterados += 1
        else:
            txt = read_text(f)
            if 'href="/trafego_pago.html"' not in txt and 'href="/admin.html"' not in txt:
                sem_menu += 1
        if "/metricas.html" in read_text(f):
            print(f"  [!] {f.relative_to(BASE)} ainda tem /metricas.html (revise manualmente)")
            restos += 1

    print()
    print("=" * 62)
    print(" RESUMO")
    print("=" * 62)
    print(f" Arquivos .html encontrados : {len(arquivos)}")
    print(f" Arquivos alterados         : {alterados}")
    print(f" Sem menu (ignorados)       : {sem_menu}")
    if restos:
        print(f" Com resíduos de /metricas  : {restos} (revise)")
    if BACKUP_DIR.exists():
        print(f" Backup em                  : {BACKUP_DIR.name}")
    print()
    print(" Tudo pronto. Abra o sistema, recarregue com Ctrl+F5")
    print(" e clique em 'Calculadora de Tráfego' no menu.")
    print()
    return 0

if __name__ == "__main__":
    sys.exit(main())