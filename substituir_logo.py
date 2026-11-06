#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Substituir logo e adicionar favicon em todos os arquivos HTML da pasta public.
"""

import os
import re

public_dir = r'e:/Projeto_Novo/public'

# Encontrar todos os arquivos HTML
html_files = []
for root, dirs, files in os.walk(public_dir):
    for f in files:
        if f.endswith('.html'):
            html_files.append(os.path.join(root, f))

print(f'Arquivos HTML encontrados: {len(html_files)}')

# Padrão para substituir o círculo laranja
old_pattern = '<div class="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white">R</div>'
new_img = '<img src="/logo.png" alt="Reverse Marketing" class="h-8 w-auto object-contain">'

substituted = 0
for filepath in html_files:
    try:
        # Ler com encoding diversos
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        original = content

        # 1. Substituir o círculo laranja pela imagem
        if old_pattern in content:
            content = content.replace(old_pattern, new_img)
            substituted += 1
            print(f'Logo substituído: {os.path.relpath(filepath, public_dir)}')

        # 2. Adicionar favicon no head
        # Procura por </head> e insere o favicon antes dele
        if '</head>' in content:
            # Insere o link de favicon antes do closing head
            favicon_link = '    <link rel="icon" type="image/png" href="/logo.png">'
            content = content.replace('</head>', favicon_link + '\n</head>')

        # 3. Salvar com UTF-8 BOM
        with open(filepath, 'w', encoding='utf-8-sig') as f:
            f.write(content)

        if original != content:
            print(f'ALTERADO: {os.path.relpath(filepath, public_dir)}')

    except Exception as e:
        print(f'ERRO em {filepath}: {e}')

print(f'\nTotal de arquivos alterados: {substituted}')
print(f'Total de arquivos processados: {len(html_files)}')