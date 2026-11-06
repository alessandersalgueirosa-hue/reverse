#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Substituir círculos laranja restantes no rodapé de todos os arquivos HTML.
"""

import os

public_dir = r'e:/Projeto_Novo/public'

# Padrão do círculo laranja no rodapé
old_footer_pattern = '<div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2">\n                    <span class="text-white font-bold text-sm">R</span>\n                </div>'

new_footer_img = '<div class="w-8 h-8 flex-shrink-0"><img src="/logo.png" alt="Reverse Marketing" class="h-8 w-auto object-contain"></div>'

# Também remover texto "Reverse Marketing" do span restante se houver
old_span_pattern = '<span class="font-bold text-white">Reverse Marketing</span>'

html_files = []
for root, dirs, files in os.walk(public_dir):
    for f in files:
        if f.endswith('.html'):
            html_files.append(os.path.join(root, f))

print(f'Arquivos HTML verificados: {len(html_files)}')

substituted = 0
for filepath in html_files:
    try:
        with open(filepath, 'r', encoding='utf-8-sig', errors='replace') as f:
            content = f.read()
        
        original = content
        
        # Substituir o círculo no rodapé
        if old_footer_pattern in content:
            content = content.replace(old_footer_pattern, new_footer_img)
            substituted += 1
            print(f'Rodapé atualizado: {os.path.relpath(filepath, public_dir)}')
        
        # Remover span "Reverse Marketing" do rodapé se permanecer
        if old_span_pattern in content:
            # Remove only if it's alone or after the image div
            content = content.replace(old_span_pattern, '')
            # Could also just mark as substituted
            
        if original != content:
            with open(filepath, 'w', encoding='utf-8-sig') as f:
                f.write(content)
    except Exception as e:
        print(f'ERRO em {filepath}: {e}')

print(f'\nTotal de arquivos de rodapé alterados: {substituted}')