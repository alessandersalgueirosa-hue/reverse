#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fazer_backup.py - Cria backup completo do projeto.
Compatível com Windows (py fazer_backup.py).

Funcionalidades:
- Cria pasta _backups se não existir
- Gera nome com data/hora atual
- Faz backup do PostgreSQL (se pg_dump disponível)
- Faz backup dos arquivos do projeto (ignorando node_modules, .git, venv, __pycache__, _backups)
- Compacta tudo em .zip usando biblioteca nativa zipfile
- Exibe mensagem de sucesso com tamanho e caminho
"""

import os
import sys
import zipfile
import datetime
import subprocess


def main():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    print(f"Projeto: {BASE_DIR}")

    # 1. Criar pasta _backups se não existir
    backup_dir = os.path.join(BASE_DIR, "_backups")
    os.makedirs(backup_dir, exist_ok=True)
    print(f"Pasta de backup: {backup_dir}")

    # 2. Gerar nome de arquivo com data/hora agora
    now = datetime.datetime.now()
    filename = f"backup_{now.strftime('%Y%m%d_%H%M')}.zip"
    filepath = os.path.join(backup_dir, filename)
    print(f"Arquivo de backup: {filepath}")

    # 3. Ler credenciais do .env se existir, senão usar padrões
    env_vars = {}
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    key, value = line.split("=", 1)
                    env_vars[key.strip()] = value.strip()
        print("Credenciais .env carregadas")
    else:
        print("Nenhum arquivo .env encontrado - usando credenciais padrao dos backups")
        env_vars = {
            "DB_HOST": "localhost",
            "DB_PORT": "5432",
            "DB_USER": "admin",
            "DB_PASSWORD": "admin123",
            "DB_NAME": "marketing_db",
        }

    # 4. Fazer backup do banco de dados PostgreSQL
    db_backup_path = None
    pg_dump_available = False
    try:
        result = subprocess.run(
            ["pg_dump", "--version"], capture_output=True, text=True, timeout=5
        )
        pg_dump_available = True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pg_dump_available = False

    if pg_dump_available:
        db_host = env_vars.get("DB_HOST", "localhost")
        db_port = env_vars.get("DB_PORT", "5432")
        db_user = env_vars.get("DB_USER", "admin")
        db_password = env_vars.get("DB_PASSWORD", "admin123")
        db_name = env_vars.get("DB_NAME", "marketing_db")

        dump_filename = f"db_{now.strftime('%Y%m%d_%H%M')}.sql"
        dump_path = os.path.join(backup_dir, dump_filename)

        env = os.environ.copy()
        env["PGPASSWORD"] = db_password

        try:
            result = subprocess.run(
                [
                    "pg_dump",
                    "-h",
                    db_host,
                    "-p",
                    db_port,
                    "-U",
                    db_user,
                    "-d",
                    db_name,
                    "-f",
                    dump_path,
                ],
                env=env,
                capture_output=True,
                text=True,
                timeout=60,
            )

            if os.path.exists(dump_path) and os.path.getsize(dump_path) > 0:
                db_backup_path = dump_path
                print(f"Backup do Banco de Dados: {db_backup_path}")
            else:
                print(
                    "Aviso: pg_dump executado mas nenhum arquivo SQL gerado"
                )
        except Exception as e:
            print(f"Aviso: Erro ao executar pg_dump: {e}")
            print(
                "Para backup manual: pg_dump -U admin -d marketing_db > backup.sql"
            )
    else:
        print("pg_dump nao encontrado - sera necessario instalacao ou backup manual")
        print("Para backup automatico instale o PostgreSQL Command Line Tools:")
        print("https://www.postgresql.org/download/windows/")

    # 5. Fazer backup dos arquivos do projeto
    # Pastas a ignorar
    IGNORED_FOLDERS = {"node_modules", ".git", "venv", "__pycache__", "_backups"}

    files_to_backup = []
    for root, dirs, files in os.walk(BASE_DIR):
        # Filtrar pastas ignoradas
        dirs[:] = [
            d
            for d in dirs
            if d not in IGNORED_FOLDERS
            and not any(d.startswith(p) for p in IGNORED_FOLDERS)
        ]

        for file in files:
            filepath = os.path.join(root, file)

            # Ignorar o proprio script de backup
            if os.path.basename(filepath) == "fazer_backup.py":
                continue

            files_to_backup.append(filepath)

    print(f"Arquivos para backup: {len(files_to_backup)}")

    # 6. Compactar tudo em um arquivo .zip usando zipfile nativo
    with zipfile.ZipFile(filepath, "w", zipfile.ZIP_DEFLATED) as zf:
        # Adicionar backup do banco de dados se existir
        if db_backup_path and os.path.exists(db_backup_path):
            zf.write(db_backup_path, os.path.basename(db_backup_path))
            print(f"  Incluido: {os.path.basename(db_backup_path)}")

        # Adicionar arquivos do projeto
        for i, fpath in enumerate(files_to_backup, 1):
            arcname = os.path.relpath(fpath, BASE_DIR)
            zf.write(fpath, arcname)

            # Print a cada 50 arquivos para nao encher o terminal
            if i % 50 == 0 or i <= 50:
                print(f"  Incluido: {arcname}")

    # 7. Mensagem de sucesso
    total_size = os.path.getsize(filepath)
    print("")
    print("=" * 50)
    print("BACKUP CONCLUIDO COM SUCESSO!")
    print(f"Arquivo: {filename}")
    print(f"Tamanho: {total_size / 1024:.2f} KB ({total_size / (1024 * 1024):.2f} MB)")
    print(f"Localizacao: {filepath}")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    main()